#pragma once

#include "types.h"

#include <cstring>

// I think nintendo's implementation only supports loading the nodes near to a certain point so
// for dumping the entire map it might not work...
// struct Octree {
//     Vec3i base = {0, 0, 0};
//     Vec3i size = {0, 0, 0};
//     u64 node_mask[0x1000] = {0};

//     void setNode(Vec3i pos, bool is_present) {
//         u32 index = (pos.x - base.x)
//                   + (pos.y - base.y) * 0x40
//                   + (pos.z - base.z) * 0x1000;

//         node_mask[index >> 6] = (node_mask[index >> 6] ^ (1 << (index & 0x3f))) | (is_present << (index & 0x3f));
//     }

//     void updateSize(const Vec3i& base, const Vec3i& size);
//     void expandDouble();
// };