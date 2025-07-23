#include "quad_reader.h"
#include "obj_writer.h"

#include <algorithm>
#include <array>
#include <iostream>

// assume lod 5 regardless
Vec3f QuadReader::processVertex(const u32* page_file_data, u32 index, const ResNode* node, const ResPageFileLayout* layout, const Vec3f& base, f32 sidelength) {
    const s32 quad_index = index >> 10;
    const u32 corner_data_index = (quad_index * sizeof(u32) + layout->corner_info_offsets[0]) / sizeof(u32);
    const u32 corner_flags = page_file_data[corner_data_index];
    const u32 vertex_data_index = (quad_index * 8 + layout->quad_data_offset) / sizeof(u32);
    const u32 pos_flags = page_file_data[vertex_data_index];
    const u32 mat_flags = page_file_data[vertex_data_index + 1];

    const s32 vt_x = index & 0x1f;
    const s32 vt_y = (index >> 5) & 0x1f;

    s32 adj_x;
    s32 adj_y;

    // we'll just assume the bit is set (unless it's the center ofc)
    const s32 not_ignore_top = (corner_flags & 0xff) != 0xd ? 1 : 0;
    const s32 not_ignore_right = (corner_flags >> 8 & 0xff) != 0xd ? 1 : 0;
    const s32 not_ignore_bottom = (corner_flags >> 0x10 & 0xff) != 0xd ? 1 : 0;
    const s32 not_ignore_left = (corner_flags >> 0x18 & 0xff) != 0xd ? 1 : 0;
    if (mat_flags >> 0x1f & 1) {
        const s32 min_y = vt_y == 0 ? 1 : 0;
        const s32 min_x = vt_x == 0 ? 1 : 0;
        const s32 diagonal = vt_x + vt_y == 4 ? 1 : 0;
        adj_x = (vt_x & diagonal & not_ignore_right) - (vt_x & min_y & not_ignore_top);
        adj_y = (vt_y & min_x & not_ignore_left) - (vt_y & diagonal & not_ignore_right);
    } else {
        const s32 min_y = vt_y == 0 ? 1 : 0;
        const s32 max_y = vt_y == 4 ? 1 : 0;
        adj_x = (vt_x & max_y & not_ignore_bottom) - (vt_x & min_y & not_ignore_top);
        const s32 min_x = vt_x == 0 ? 1 : 0;
        const s32 max_x = vt_x == 4 ? 1 : 0;
        adj_y = (vt_y & min_x & not_ignore_left) - (vt_y & max_x & not_ignore_right);
    }

    const s32 adjusted_x = vt_x + adj_x;
    const s32 adjusted_y = vt_y + adj_y;

    const u32 byte_offset = adjusted_x * sizeof(u32) + adjusted_y * sizeof(u32) * 5 + quad_index * sizeof(u32) * 5 * 5 + layout->pos_adjust_offset0;
    // const u32 byte_offset = adjusted_x * 4 + adjusted_y * 8 + quad_index * 0x10 + layout->pos_adjust_offset1;
    const u32 pos_adjust_flags = page_file_data[byte_offset / sizeof(u32)];
    const u32 adjust_shift = (pos_flags >> 18) & 0x1f;

    const f32 x = (f32)((((node->x >> 2 << 5) + (pos_flags & 0x3f)) << 13) - 0x20000 + ((pos_adjust_flags & 0x7ff) << adjust_shift));
    const f32 y = (f32)((((node->y >> 2 << 5) + (pos_flags >> 6 & 0x3f)) << 13) - 0x20000 + ((pos_adjust_flags >> 11 & 0x3ff) << 1 << adjust_shift));
    const f32 z = (f32)((((node->z >> 2 << 5) + (pos_flags >> 12 & 0x3f)) << 13) - 0x20000 + ((pos_adjust_flags >> 21 & 0x7ff) << adjust_shift));

    return Vec3(x * sidelength + base.x, y * sidelength + base.y, z * sidelength + base.z);
}

static void writeQuad(u32*& buffer, s32 x, s32 y, s32 index) {
    #define PACK(X, Y, IDX) (X) | ((Y) << 5) | ((IDX) << 10)
    buffer[0] = PACK(x     , y    , index);
    buffer[1] = PACK(x + 1 , y    , index);
    buffer[2] = PACK(x     , y + 1, index);

    buffer[3] = PACK(x     , y + 1, index);
    buffer[4] = PACK(x + 1 , y    , index);
    buffer[5] = PACK(x + 1 , y + 1, index);

    buffer += 6;
    #undef PACK
}

template <s32 N>
static inline void writeIndexBuffer(u32*& buffer) {
    for (u32 index = 0; index < 0x800; ++index) {
        for (s32 y = 0; y < (1 << N); ++y) {
            for (s32 x = 0; x < (1 << N); ++x) {
                writeQuad(buffer, x, y, index);
            }
        }
    }
}

void QuadReader::genIndexBuffer() {
    mIndexBuffer.resize(0xff000);
    u32* buffer = mIndexBuffer.data();

    writeIndexBuffer<0>(buffer);
    writeIndexBuffer<1>(buffer);
    writeIndexBuffer<2>(buffer);
    writeIndexBuffer<3>(buffer);
}

void QuadReader::dumpObjFiles() {
    const ResQuadMeshInfo* quad_mesh = mAccessor.getQuadMesh();

    const ResNode* nodes = mAccessor.getArray(quad_mesh->nodes);
    const ResStreamDependency* quad_streams = mAccessor.getArray(quad_mesh->stream_dependencies);
    const ResQuadStreamInfo* stream_info = mAccessor.getArray(quad_mesh->stream_info);
    const ResPageFile* page_files = mAccessor.getArray(quad_mesh->page_files);

    const f32 sidelength = mAccessor.calcSidelength(5);

    constexpr static s32 sBaseIndexBufferIndices[4] = {
        0, 0x3000, 0xf000, 0x3f000
    };

    std::vector<QuadData> quad_data{};

    s32 count = 0;
    s32 file_no = 0;
    for (size_t i = 0; i < quad_mesh->nodes.count; ++i) {
        const ResNode* node = nodes + i;
        if (node->lod_level != 5)
            continue;

        if (count > 10000) {
            const std::string path = std::format("{}.obj", file_no++);
            std::cout << "Outputting: " << path << "\n";
            writeFile(path, quad_data);
            count = 0;
        } else {
            ++count;   
        }

        const u32 stream_start = quad_streams[i].start_index;
        const u32 stream_end = quad_streams[i].end_index;

        for (size_t j = stream_start; j < stream_end; ++j) {
            const ResQuadStreamInfo* stream = stream_info + j;
            const ResPageFile* page_file = page_files + stream->getPageFileIndex();
            
            const u32 far_lod = (s32)node->lod_level >= quad_mesh->num_far_lod_levels ? quad_mesh->num_far_lod_levels - 1 : node->lod_level;
            const s32 num_subdivisions = -(far_lod - node->lod_level);
            const s32 base_index = sBaseIndexBufferIndices[num_subdivisions];

            QuadData data{};
            std::vector<u8> page_file_data{};
            mAccessor.loadQuadFile(page_file->id, page_file_data);

            // attempt to de-dupe vertices
            constexpr static std::array<u32, 25> indices = {
                0, 6, 12, 18, 19,
                24, 30, 36, 42, 43,
                48, 54, 60, 66, 67,
                72, 78, 84, 90, 91,
                74, 80, 86, 92, 95
            };

            for (s32 i = 0; i < stream->num_quads; ++i) {
                for (const auto idx : indices) {
                    data.vertices.push_back(
                    processVertex(reinterpret_cast<const u32*>(page_file_data.data()),
                                  mIndexBuffer[base_index + idx + i * 96] + (stream->base_vertex_index << 10),
                                  node, &quad_mesh->normal_lod_layout, quad_mesh->single_bounds.min, sidelength));
                }
            
                for (s32 y = 0; y < 4; ++y) {
                    for (s32 x = 0; x < 4; ++x) {
                        data.triangles.emplace_back(Triangle{
                            x       + y * 5         + i * 25,
                            x + 1   + y * 5         + i * 25,
                            x       + (y + 1) * 5   + i * 25
                        });
                        data.triangles.emplace_back(Triangle{
                            x       + (y + 1) * 5   + i * 25,
                            x + 1   + y * 5         + i * 25,
                            x + 1   + (y + 1) * 5   + i * 25
                        });
                    }
                }
            }

            // naive approach with duplicated vertices
            // const s32 vertex_count = (6 << num_subdivisions * 2) * stream->num_quads;
            // for (s32 i = 0; i < vertex_count; ++i) {
            //     data.vertices.push_back(
            //         processVertex(reinterpret_cast<const u32*>(page_file_data.data()),
            //                       mIndexBuffer[base_index + i] + (stream->base_vertex_index << 10),
            //                       node, &quad_mesh->normal_lod_layout, sidelength));

            //     if (i % 3 == 2)
            //         data.triangles.emplace_back(Triangle{i - 2, i - 1, i});
            // }

            quad_data.push_back(data);
        }
    }

    const std::string path = std::format("{}.obj", file_no++);
    std::cout << "Outputting: " << path << "\n";
    writeFile(path, quad_data);
}

void QuadReader::writeFile(const Path& filename, std::vector<QuadData>& quad_data) const {
    ObjWriter writer(mOutputDir / filename);

    for (const auto& data : quad_data) {
        for (size_t j = 0; j < data.vertices.size(); ++j)
            writer.writeVertex(data.vertices[j]);
    }

    // obj files are 1 indexed
    s32 current = 1;
    for (const auto& data : quad_data) {
        for (size_t j = 0; j < data.triangles.size(); ++j)
            writer.writeFace(data.triangles[j].a + current, data.triangles[j].b + current, data.triangles[j].c + current);
        current += data.vertices.size();
    }

    quad_data.clear();
}

// static BoundBox3i CalcNodeBoundingBox(const ResNode* nodes, s32 start, s32 end) {
//     BoundBox3i bounds{};

//     for (s32 i = start; i < end; ++i) {
//         const ResNode* node = nodes + i;

//         bounds.min.x = std::min(bounds.min.x, static_cast<s32>(node->x));
//         bounds.min.y = std::min(bounds.min.y, static_cast<s32>(node->y));
//         bounds.min.z = std::min(bounds.min.z, static_cast<s32>(node->z));

//         bounds.max.x = std::max(bounds.max.x, static_cast<s32>(node->x));
//         bounds.max.y = std::max(bounds.max.y, static_cast<s32>(node->y));
//         bounds.max.z = std::max(bounds.max.z, static_cast<s32>(node->z));
//     }

//     bounds.min.x -= 2;
//     bounds.min.y -= 2;
//     bounds.min.z -= 2;
//     bounds.max.x += 2;
//     bounds.max.y += 2;
//     bounds.max.z += 2;

//     return bounds;
// }

// static void CalcConnectionMask(const ResNode* nodes, const Octree& prev, Octree& curr, s32 start, s32 end, std::vector<u32>& masks) {
//     #define INDEX(X, Y, Z) ((X) + (Y) * 0x40 + (Z) * 0x1000)
//     #define MASK(X, Y, Z) (prev.node_mask[INDEX((X), (Y), (Z)) >> 6] >> (INDEX((X), (Y), (Z)) & 0x3f) & 7)
    
//     for (s32 i = start; i < end; ++i) {
//         const ResNode* node = nodes + i;
//         const s32 x = static_cast<s32>(node->x) - prev.base.x;
//         const s32 y = static_cast<s32>(node->y) - prev.base.y;
//         const s32 z = static_cast<s32>(node->z) - prev.base.z;

//         const u32 mask0 = MASK(x - 1, y, z);
//         const u32 mask1 = MASK(x - 1, y - 1, z - 1)
//                         | MASK(x - 1, y    , z - 1) << 3
//                         | MASK(x - 1, y + 1, z - 1) << 6
//                         | MASK(x - 1, y - 1, z    ) << 9
//                         | mask0 << 12;
//         const u32 mask2 = mask1 | MASK(x - 1, y + 1, z) << 15;
//         const u32 mask3 = mask2 | MASK(x - 1, y - 1, z + 1) << 18 | MASK(x - 1, y, z + 1) << 21;
//         const u32 mask4 = mask3 | MASK(x - 1, y + 1, z + 1) << 24;

//         const u32 mask = ((mask1 & 0x161b) != 0) << 0        // (0, 0, 0)
//                     | ((mask1 & 0x2412) != 0) << 1           // (1, 0, 0)
//                     | ((mask1 & 0x4c36) != 0) << 2           // (2, 0, 0)
//                     | ((mask1 & 0x3018) != 0) << 3           // (0, 1, 0)
//                     | ((mask1 & 0x2010) != 0) << 4           // (1, 1, 0)
//                     | ((mask1 & 0x6030) != 0) << 5           // (2, 1, 0)
//                     | ((mask2 & 0x190d8) != 0) << 6          // (0, 2, 0)
//                     | ((mask2 & 0x12090) != 0) << 7          // (1, 2, 0)
//                     | ((mask2 & 0x341b0) != 0) << 8          // (2, 2, 0)
//                     | ((mask1 & 0x3600) != 0) << 9           // (0, 0, 1)
//                     | ((mask1 & 0x2400) != 0) << 0xa         // (1, 0, 1)
//                     | ((mask1 & 0x6c00) != 0) << 0xb         // (2, 0, 1)
//                     | ((mask0 & 3) != 0) << 0xc              // (0, 1, 1)
//                                                              // (1, 1, 1) -> this is the node itself
//                     | ((mask0 & 6) != 0) << 0xe              // (2, 1, 1)
//                     | ((mask2 & 0x1b000) != 0) << 0xf        // (0, 2, 1)
//                     | ((mask2 & 0x12000) != 0) << 0x10       // (1, 2, 1)
//                     | ((mask2 & 0x36000) != 0) << 0x11       // (2, 2, 1)
//                     | ((mask3 & 0x6c1600) != 0) << 0x12      // (0, 0, 2)
//                     | ((mask3 & 0x482400) != 0) << 0x13      // (1, 0, 2)
//                     | ((mask3 & 0xd84c00) != 0) << 0x14      // (2, 0, 2)
//                     | ((mask3 & 0x603000) != 0) << 0x15      // (0, 1, 2)
//                     | ((mask3 & 0x402000) != 0) << 0x16      // (1, 1, 2)
//                     | ((mask3 & 0xc06000) != 0) << 0x17      // (2, 1, 2)
//                     | ((mask4 & 0x3619000) != 0) << 0x18     // (0, 2, 2)
//                     | ((mask4 & 0x2412000) != 0) << 0x19     // (1, 2, 2)
//                     | ((mask4 & 0x6c34000) != 0) << 0x1a;    // (2, 2, 2)

//         if (mask != 0)
//             curr.setNode(Vec3(static_cast<s32>(node->x), static_cast<s32>(node->y), static_cast<s32>(node->z)), true);
        
//         masks[i] = mask;
//     }

//     #undef INDEX
//     #undef MASK
// }

// void QuadReader::genOctree() {
//     const ResQuadMeshInfo* quad_mesh = mAccessor.getQuadMesh();
//     const ResNode* nodes = mAccessor.getArray(quad_mesh->nodes);
//     const ResChildNode* children = mAccessor.getArray(quad_mesh->child_nodes);
//     const ResPageFileDependency* dependencies = mAccessor.getArray(quad_mesh->file_dependencies);

//     const BoundBox3i bounds = CalcNodeBoundingBox(nodes, 0, quad_mesh->num_root_nodes);
//     mOctree.base = bounds.min;
//     mOctree.size = {bounds.getSizeX() + 1, bounds.getSizeY() + 1, bounds.getSizeZ() + 1};

//     std::cout << mOctree.base.x << ", " << mOctree.base.y << ", " << mOctree.base.z << "\n";
//     std::cout << mOctree.size.x << ", " << mOctree.size.y << ", " << mOctree.size.z << "\n";

//     mNodeMasks.resize(quad_mesh->nodes.count);
//     std::fill(mNodeMasks.begin(), mNodeMasks.end(), 0);

//     const s32 max_lod = mAccessor.calcMaxLod();
//     s32 end = quad_mesh->num_root_nodes;
//     s32 start = 0;
//     for (s32 i = 0; i < max_lod; ++i) {
//         mPrevOctree = mOctree;

//         CalcConnectionMask(nodes, mPrevOctree, mOctree, start, end, mNodeMasks);

//         s32 child_count = 0;
//         for (s32 j = start; j < end; ++j) {
//             if (children[j].start_index < children[j].end_index) {
//                 const ResNode* node = nodes + j;
//                 mOctree.setNode(Vec3(static_cast<s32>(node->x), static_cast<s32>(node->y), static_cast<s32>(node->z)), true);
//                 child_count += children[j].end_index - children[j].start_index;
//             }
//         }

//         // for (s32 j = start; j < end; ++j) {
//         //     if (dependencies[j].start_index < dependencies[j].end_index) {
//         //         const ResNode* node = nodes + j;
//         //         mOctree.setNode(Vec3(static_cast<s32>(node->x), static_cast<s32>(node->y), static_cast<s32>(node->z)), true);
//         //     }
//         // }

//         start = end;
//         end += child_count;

//         if (end - start > 0) {
//             const BoundBox3i new_bounds = CalcNodeBoundingBox(nodes, start, end);

//             const s32 base_x = new_bounds.min.x < 0 ? new_bounds.min.x + 1 : new_bounds.min.x;
//             const s32 base_y = new_bounds.min.y < 0 ? new_bounds.min.y + 1 : new_bounds.min.y;
//             const s32 base_z = new_bounds.min.z < 0 ? new_bounds.min.z + 1 : new_bounds.min.z;

//             const s32 max_x = new_bounds.max.x < 0 ? new_bounds.max.x + 1 : new_bounds.max.x;
//             const s32 max_y = new_bounds.max.y < 0 ? new_bounds.max.y + 1 : new_bounds.max.y;
//             const s32 max_z = new_bounds.max.z < 0 ? new_bounds.max.z + 1 : new_bounds.max.z;

//             const s32 new_base_x = (base_x >> 1) + (new_bounds.min.x % 2 >> 0x1f);
//             const s32 new_base_y = (base_y >> 1) + (new_bounds.min.y % 2 >> 0x1f);
//             const s32 new_base_z = (base_z >> 1) + (new_bounds.min.z % 2 >> 0x1f);

//             const s32 new_size_x = (max_x >> 1) - new_base_x + (new_bounds.max.x % 2 >> 0x1f) + 1;
//             const s32 new_size_y = (max_y >> 1) - new_base_y + (new_bounds.max.y % 2 >> 0x1f) + 1;
//             const s32 new_size_z = (max_z >> 1) - new_base_z + (new_bounds.max.z % 2 >> 0x1f) + 1;

//             Vec3i base = {new_base_x, new_base_y, new_base_z};
//             Vec3i size = {new_size_x, new_size_y, new_size_z};

//             if (mOctree.size.x < 0x21) {
//                 base.x = mOctree.base.x;
//                 size.x = mOctree.size.x;
//             }
//             mOctree.updateSize(base, size);
//             mOctree.expandDouble();
//             std::cout << mOctree.base.x << ", " << mOctree.base.y << ", " << mOctree.base.z << "\n";
//             std::cout << mOctree.size.x << ", " << mOctree.size.y << ", " << mOctree.size.z << "\n";
//         }
//     }
// }