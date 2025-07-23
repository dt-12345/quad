#include "octree.h"

// void Octree::updateSize(const Vec3i& new_base, const Vec3i& new_size) {
//     s32 element_count = (new_size.x + 0x3f > -1 ? new_size.x + 0x3f : new_size.x + 0x7f) >> 6;
//     if (element_count < 2)
//         element_count = 1;

//     const u32 x_shift = new_base.x - base.x > -1 ? new_base.x - base.x : new_base.x - base.x + 0x3f;
//     u32 y_shift = new_base.y - base.y;
//     u32 z_shift = new_base.z - base.z;
//     const u32 leftover_bits = (new_base.x - base.x) % 0x40;

//     if (leftover_bits == 0) {
//         if (new_size.x > 0 && new_size.y > 0 && new_size.z > 0) {
//             s32 mask_index = 0;
//             for (s32 z = 0; z < new_size.z; ++z) {
//                 u64* to = node_mask + mask_index;
//                 for (s32 y = 0; y < new_size.y; ++y) {
//                     u64* from = node_mask + ((x_shift >> 6) + y_shift + z_shift * 0x40);
//                     for (s32 x = 0; x < element_count; ++x)
//                         *to++ = *from++;
//                     ++y_shift;
//                 }
//                 ++z_shift;
//                 mask_index += 0x40;
//             }
//         }
//     } else {
//         if (new_size.x > 0 && new_size.y > 0 && new_size.z > 0) {
//             s32 mask_index = 0;
//             for (s32 z = 0; z < new_size.z; ++z) {
//                 u64* to = node_mask + mask_index;
//                 for (s32 y = 0; y < new_size.y; ++y) {
//                     u64* from = node_mask + ((x_shift >> 6) + y_shift + z_shift * 0x40) + 1;
//                     for (s32 x = 0; x < element_count; ++x) {
//                         const u64 remainder = from[-1] >> leftover_bits;
//                         if (x + 1 < size.x) {
//                             *to++ = (*from++) << (0x40 - leftover_bits) | remainder;
//                         } else {
//                             *to++ = remainder; ++from;
//                         }
//                     }
//                     ++y_shift;
//                 }
//                 ++z_shift;
//                 mask_index += 0x40;
//             }
//         }
//     }

//     base = new_base;
//     size = new_size;
// }

/*
    doubles every bit in a 32 bit integer, expanding it into a 64 bit integer
    example:
    0b10101010101010101010101010101010
    becomes
    0b1100110011001100110011001100110011001100110011001100110011001100
*/
// static inline u64 DoubleBits(u64 value) {
//     u64 out = ((value & 0xffffffffull) | (value & 0xffffffffull) << 0x10) & 0xffff0000ffffull;
//     out = (out | out << 8) & 0xff00ff00ff00ffull;
//     out = (out | out << 4) & 0xf0f0f0f0f0f0f0full;
//     out = (out | out << 2) & 0x3333333333333333ull;
//     out = (out | out << 1) & 0x5555555555555555ull;
//     return out | out << 1;
// }

// void Octree::expandDouble() {
//     const u32 x_shift = (size.x > -1 ? size.x : size.x + 0x3f) >> 6;

//     if (size.x > 0 && size.y > 0 && size.z > 0) {
//         for (s32 z = size.z; z > 0; --z) {
//             if (size.x % 0x40 > 0) {
//                 u64* from = node_mask + (x_shift - 1 + size.y + (z - 1) * 0x40) - 1;
//                 for (s32 y = size.y; y > 0; --y) {
//                     const u64 orig = node_mask[x_shift - 1 + y + (size.z - 1) * 0x40];
//                     if (size.x % 0x40 > 0x20) {
//                         const u64 doubled = DoubleBits(orig >> 0x20);
//                         node_mask[x_shift * 2 + 1 + (y - 1) * 2 + 1 + (z - 1) * 0x40 * 2] = doubled;
//                         node_mask[x_shift * 2 + 1 + (y - 1) * 2 + 1 + (z - 1) * 0x40 * 2 + 0x40] = doubled;
//                     }
//                     const u64 doubled = DoubleBits(orig & 0xffffffff);
//                     node_mask[x_shift * 2 + (y - 1) * 2 + (z - 1) * 0x40 * 2] = doubled;
//                     node_mask[x_shift * 2 + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2] = doubled;
//                     node_mask[x_shift * 2 + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = doubled;
//                     node_mask[x_shift * 2 + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = doubled;

//                     if (size.x > 0x3f) {
//                         u32 x_index = x_shift * 2 - 2;
//                         for (s32 x = x_shift; x > 0; --x) {
//                             const u64 orig = *from--;

//                             const u64 top_doubled = DoubleBits(orig >> 0x20);
//                             const u64 bottom_doubled = DoubleBits(orig & 0xffffffff);

//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2] = top_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + 1 + (z - 1) * 0x40 * 2] = top_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = top_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + 1 + (z - 1) * 0x40 * 2 + 0x40] = top_doubled;

//                             node_mask[x_index + (y - 1) * 2 + (z - 1) * 0x40 * 2] = bottom_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2] = bottom_doubled;
//                             node_mask[x_index + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = bottom_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = bottom_doubled;

//                             x_index -= 2;
//                         }
//                     }
//                 }
//             } else {
//                 if (size.x > 0x3f) {
//                     u64* from = node_mask + (x_shift - 1 + size.y - 1 + (z - 1) * 0x40);
//                     for (s32 y = size.y; y > 0; --y) {
//                         u32 x_index = x_shift * 2 - 2;
//                         for (s32 x = x_shift; x > 0; --x) {
//                             const u64 orig = *from--;

//                             const u64 top_doubled = DoubleBits(orig >> 0x20);
//                             const u64 bottom_doubled = DoubleBits(orig & 0xffffffff);

//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2] = top_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + 1 + (z - 1) * 0x40 * 2] = top_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = top_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + 1 + (z - 1) * 0x40 * 2 + 0x40] = top_doubled;

//                             node_mask[x_index + (y - 1) * 2 + (z - 1) * 0x40 * 2] = bottom_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2] = bottom_doubled;
//                             node_mask[x_index + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = bottom_doubled;
//                             node_mask[x_index + 1 + (y - 1) * 2 + (z - 1) * 0x40 * 2 + 0x40] = bottom_doubled;

//                             x_index -= 2;
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     base.x <<= 1;
//     base.y <<= 1;
//     base.z <<= 1;
//     size.x <<= 1;
//     size.y <<= 1;
//     size.z <<= 1;
// }