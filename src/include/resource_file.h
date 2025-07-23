#pragma once

#include "types.h"

template <typename T>
struct ResArray {
    u32 offset;
    u32 count;

    const T* getArray(uintptr_t base) const {
        return reinterpret_cast<const T*>(base + offset);
    }
};

struct ResNode {
    u16 x;
    u16 y;
    u16 z;
    u16 lod_level;
};
static_assert(sizeof(ResNode) == 0x8);

struct ResChildNode {
    u32 start_index;
    u32 end_index;
};
static_assert(sizeof(ResChildNode) == 0x8);

struct ResPageFileDependency {
    u16 start_index;
    u16 end_index;
};
static_assert(sizeof(ResPageFileDependency) == 0x4);

struct ResStreamDependency {
    u32 start_index;
    u32 end_index;
};
static_assert(sizeof(ResStreamDependency) == 0x8);

struct ResIndexInfo {
    u32 base_vertex_stream_index;
    u16 base_material_palette_index;
    u8 vertex_stream_count;
    u8 _07;
    u32 _08;
    u32 _0c;
};
static_assert(sizeof(ResIndexInfo) == 0x10);

struct Section5 {
    u16 start_index;
    u16 end_index;
};
static_assert(sizeof(Section5) == 0x4);

struct ResChunkStreamInfo {
    u32 base_index;
    u32 triangle_count;
    u16 flags;
    u16 page_file_index;
};
static_assert(sizeof(ResChunkStreamInfo) == 0xc);

struct ResMaterialPalette {
    Vec3f u_bias;
    f32 array_index;
    Vec3f v_bias;
    f32 uv_scale;
};
static_assert(sizeof(ResMaterialPalette) == 0x20);

struct ResQuadStreamInfo {
    u16 page_file_index_and_flags;
    u16 base_vertex_index;
    u16 num_quads;

    u16 getPageFileIndex() const {
        return page_file_index_and_flags & 0x1fff;
    }
};
static_assert(sizeof(ResQuadStreamInfo) == 0x6);

struct ResPageFile {
    u32 decompressed_size;
    u32 id;
};
static_assert(sizeof(ResPageFile) == 0x8);

struct ResPageFileLayout {
    s32 file_size;
    u32 _04;
    u32 _08;
    u32 _0c;
    u32 _10;
    s32 quad_data_offset;
    s32 pos_adjust_offset0;
    s32 pos_adjust_offset1;
    s32 lod_far_corner_info_offset;
    s32 corner_info_offsets[3];
    s32 _30;
    s32 _34;
};
static_assert(sizeof(ResPageFileLayout) == 0x38);

struct ResDispMeshInfo {
    ResArray<u8> _00;
    ResArray<u8> _08;
    ResArray<u8> _10;
    ResArray<ResPageFile> page_files;
    u32 _20;
};
static_assert(sizeof(ResDispMeshInfo) == 0x24);

struct ResChunkMeshInfo {
    ResArray<ResNode> nodes;
    ResArray<ResChildNode> node_children;
    ResArray<ResPageFileDependency> file_dependencies;
    ResArray<BoundBox3f> node_bounds;
    ResArray<ResIndexInfo> index_info;
    ResArray<u32> no_blend_nodes;
    ResArray<ResChunkStreamInfo> stream_info;
    ResArray<ResMaterialPalette> material_palettes;
    ResArray<ResPageFile> page_files;
    s32 num_root_nodes;
    ResPageFileDependency root_node_dependencies;
    Vec3f base_pos;
    f32 min_sidelength;
    u32 num_subdivisions;
    BoundBox3f bounds;
};
static_assert(sizeof(ResChunkMeshInfo) == 0x7c);

struct ResQuadMeshInfo {
    s32 num_far_lod_levels;
    s32 num_normal_lod_levels;
    s32 num_root_nodes;
    ResPageFileDependency root_chunk_dependencies;
    ResArray<ResNode> nodes;
    ResArray<ResChildNode> child_nodes;
    ResArray<ResStreamDependency> stream_dependencies;
    ResArray<u8> layout_types;
    ResArray<Section5> _30;
    ResArray<ResPageFileDependency> file_dependencies;
    ResArray<BoundBox3f> node_bounds;
    ResArray<ResQuadStreamInfo> stream_info;
    ResArray<ResPageFile> page_files;
    BoundBox3f single_bounds;
    BoundBox3f bounds;
    ResPageFileLayout far_lod_layout;
    ResPageFileLayout normal_lod_layout;
};
static_assert(sizeof(ResQuadMeshInfo) == 0xf8);

struct ResCaveResource {
    char magic[8];
    u32 file_size;
    u32 version;
    u32 id;
    Matrix34f transform;
    ResDispMeshInfo disp_mesh;
    ResChunkMeshInfo chunk_mesh;
    ResQuadMeshInfo quad_mesh;
};
static_assert(sizeof(ResCaveResource) == 0x1dc);