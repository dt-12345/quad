#version 450 core
#extension GL_ARB_gpu_shader_int64 : enable
#extension GL_ARB_shader_ballot : enable
#extension GL_ARB_shader_group_vote : enable
#extension GL_EXT_shader_image_load_formatted : enable
#extension GL_EXT_texture_shadow_lod : enable
#extension GL_ARB_shader_draw_parameters : enable
#extension GL_ARB_shader_viewport_layer_array : enable
#extension GL_NV_viewport_array2 : enable
#pragma optionNV(fastmath off)

/* reserved by system */
layout (binding = 0, std140) uniform _support_buffer {
    uint alpha_test;
    uint is_bgra[8];
    precise vec4 viewport_inverse;
    precise vec4 viewport_size;
    int frag_scale_count;
    precise float render_scale[73];
    ivec4 tfe_offset;
    int tfe_vertex_count;
} support_buffer;

/* binding = bfsha ubo index + 4 */

/* cave_QM_PageLayoutDataUBO */
layout (binding = 17, std140) uniform gsys_user2 {
    /* 0x00 */ int corner_data_offset;
    /* 0x04 */ int _04;
    /* 0x08 */ int _08;
    /* 0x0c */ int _0c;
    /* 0x10 */ int quad_data_offset;
    /* 0x14 */ int pos_adjust_offset0;
    /* 0x18 */ int pos_adjust_offset1;
    /* 0x1c */ int file_size;
    /* 0x20 */ int _20;
    /* 0x24 */ float _24;
    /* 0x28 */ float _28;
} page_layout_data;

/* cave_QM_InstanceDataUBO */
layout (binding = 16, std140) uniform gsys_user1 {
    /* 0x00 */ vec4 mtx[3]; // nintendo stores matrices in row-major order while glsl is column-major
    /* 0x30 */ int num_far_lod; // 4 (0, 1, 2, 3) variably sized?
    /* 0x34 */ int num_lod; // 3 (3, 4, 5) fixed size?
    /* 0x38 */ float normalize_factor; // 1.0 / (1 << (num_lod - 1)), scales the 2d vertex coordinate to between 0 and 1
    /* 0x3c */ vec3 base_pos;
    /* 0x48 */ uint enable_fractal_mat;
    /* 0x4c */ float fractal_mat_base_dist;
    /* 0x50 */ float fractal_mat_dist_multi;
    /* 0x54 */ float fractal_mat_scale_pow;
    /* 0x58 */ float fractal_mat_transition_range;
    /* 0x5c */ float fractal_mat_uniform_scale;
    /* 0x60 */ float fractal_mat_amount;
    /* 0x64 */ float _64;   // fractal_mat_dist_multi ^ fractal_mat_scale_po if enable_fractal_mat else 0
    /* 0x68 */ float _68;   // 1 / log2f(fractal_mat_dist_multi) * 0.5
    /* 0x6c */ float _6c;   // -log2f(fractal_mat_base_dist) / log2f(fractal_mat_dist_multi)
    /* 0x70 */ float _70;   // -1 / fractal_mat_transition_range
    /* 0x74 */ float _74;   // 0.5 / fractal_mat_transition_range + 0.5
    /* 0x78 */ float _78;   // 1 / fractal_mat_uniform_scale
} instance_data;

/* cave_QM_DrawCallDataUBO */
layout (binding = 7, std140) uniform gsys_user3 {
    /* 0x00 */ double vertex_buffer; // void*, probably unused by the shader
    /* 0x08 */ double normals_descriptor_slot; // u64, probably unused by the shader
    /* 0x10 */ double material_weights_ao_descriptor_slot; // u64, probably unused by the shader
    /* 0x18 */ uint _18;
    /*
        some_lod = lod >= num_far_lod ? num_far_lod - 1 : lod => 0/1/2/3 -> 0/1/2/3, 4/5 -> 3
        _18 lower 16 bits = num_far_lod - some_lod - 1
            0 -> 3
            1 -> 2
            2 -> 1
            3 -> 0
            4 -> 0
            5 -> 0
        _18 upper 16 bits = some_lod - lod + num_lod + 1
            0 -> 4
            1 -> 4
            2 -> 4
            3 -> 4
            4 -> 3
            5 -> 2
    */
    /* 0x1c */ uint connected_mask; // seems to be the same as with chunk files
    /* 0x20 */ ivec3 pos; // in terms of how many chunks of this lod level
    /* 0x2c */ float sidelength;
    /*
        max_lod = num_far_lod + num_lod - 2 == 5
        adj = lod - num_far_lod > -1 ? lod - num_far_lod + 1 : 0 (0/1/2/3 -> 0, 4/5 -> 1/2)
        sidelength = (quad_max - quad_min) / (1 << max_lod) * (1 << (max_lod - lod + adj))) / 2^18

        (1 << (max_lod - lod + adj))) / (1 << max_lod):
            0 -> 1
            1 -> 0.5
            2 -> 0.25
            3 -> 0.125
            4 -> 0.125
            5 -> 0.125
    */
} draw_call_data;

/* Context */
layout (binding = 5, std140) uniform gsys_context {
    /* 0x00 */ vec4 view[3];
    /* 0x30 */ vec4 view_proj[4];
    /* 0x70 */ vec4 proj[4];
    /* 0xb0 */ vec4 inv_view[3];
    /* 0xe0 */ vec4 near_far_param; // near, far, near/far, 1 - near/far
    /* 0xf0 */ vec4 near_far_param2; // -1 / (far - near), near / (far - near), aspect, 1 / aspect
    /* 0x100 */ vec4 near_far_param3; // far - near, 0, 0, 0
    // etc.
} context;

/*
    surely this the quad file data or something, I just don't know where this is bound from
    the bfsha file says this shader isn't even supposed to have any storage buffers...
*/
layout (binding = 0, std430) buffer _page_file_data {
    uint data[];
} page_file_data;

layout (location = 0) out vec3 out_pos_camera_space;
layout (location = 1) out vec4 out_volume_mask_tex_coords;
layout (location = 2) out vec3 out_pos_local;
layout (location = 3) out uvec4 out_mat_flags;
layout (location = 4) out vec2 out_cave_tex_coords;
layout (location = 5) out vec2 out_2d_coords;

void main() {
    gl_PointSize = 1.0;
    gl_Position.x = 0.0;
    gl_Position.y = 0.0;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;

    // this is the actual quad index, bottom 10 bits are two 5 bit values
    int quad_index = bitfieldExtract(gl_VertexID, 10, 22);

    int index0 = int(uint(quad_index << 2 + page_layout_data.corner_data_offset) >> 2); // this section is 4 byte entries
    uint corner_positions = page_file_data.data[index0];

    int quad_data_offset = int(uint(quad_index << 3 + page_layout_data.quad_data_offset) >> 2); // byte offset, this section is 8 byte entries
    uint pos_flags = page_file_data.data[quad_data_offset];
    uint mat_flags = page_file_data.data[quad_data_offset + 1];

    int far_lod_threshold = instance_data.num_lod - 1;  // 2
    int max_coord = 1 << (far_lod_threshold & 31); // 4
    // these are the 2d positions of the current vertex on the current quad
    int vertex_x = int(bitfieldExtract(gl_VertexID, 0, 5));
    int vertex_y = int(bitfieldExtract(gl_VertexID, 5, 5));
    int num_verts_per_side = max_coord + 1; // 5
    int temp_142 = 0;
    int temp_25 = 0;
    // adjusted 2d coordinates of vertex on quad
    int adjusted_x;
    int adjusted_y;
    // this section calculates an adjustment for the vertex so the individual quads blend together smoothly
    if (far_lod_threshold == 0) { // lod1 checks == 1, lod2/lodfar checks == 2
        int temp_29 = ((vertex_y << 1) + vertex_x) << 3;
        int temp_30 = bitfieldInsert(temp_29, 5, 8, 8);
        int temp_32 = bitfieldExtract(temp_30, 8, 8);
        uint temp_33 = bitfieldExtract(corner_positions, temp_30 & 255, temp_32);
        uint type_mask = bitfieldInsert(temp_33, 1, 8, 8);
        int num_bits = int(bitfieldExtract(type_mask, 8, 8)); // should be 1
        int type = int(type_mask & 255);
        bool connected = bitfieldExtract(draw_call_data.connected_mask, type, num_bits) != 0;
        adjusted_y = vertex_y;
        adjusted_x = vertex_x;
        if (connected) {
            int temp_43 = bitfieldInsert(temp_29 + 5, 3, 8, 8);
            int temp_44 = temp_43 & 255;
            int temp_45 = bitfieldExtract(temp_43, 8, 8); // 3
            temp_142 = 1;
            temp_25 = int(bitfieldExtract(corner_positions, temp_44, temp_45));
        }
    } else {
        bool is_single_trig = bitfieldExtract(mat_flags, 31, 1) != 0;
        // bits to check for a neighboring node
        uint top = bitfieldExtract(corner_positions, 0, 8);
        uint right = bitfieldExtract(corner_positions, 8, 8);
        uint bottom = bitfieldExtract(corner_positions, 16, 8);
        uint left = bitfieldExtract(corner_positions, 24, 8);
        int x_adj;
        int y_adj;
        // this "quad" only has one triangle, not 2
        if (is_single_trig) {
            int connected_top = int(draw_call_data.connected_mask >> (int(top) & 31));
            int connected_left = int(draw_call_data.connected_mask >> (int(left) & 31));
            int connected_right = int(draw_call_data.connected_mask >> (int(right) & 31));
            int min_y = vertex_y == 0 ? 1 : 0;
            int min_x = vertex_x == 0 ? 1 : 0;
            int is_on_diagonal = vertex_x + vertex_y == max_coord ? 1 : 0;
            x_adj = (vertex_x & connected_right & is_on_diagonal) - (vertex_x & connected_top & min_y);
            y_adj = (vertex_y & connected_left & min_x) - (vertex_y & connected_right & is_on_diagonal);
        } else {
            int connected_top = int(draw_call_data.connected_mask >> (int(top) & 31));
            int connected_right = int(draw_call_data.connected_mask >> (int(right) & 31));
            int connected_bottom = int(draw_call_data.connected_mask >> (int(bottom) & 31));
            int connected_left = int(draw_call_data.connected_mask >> (int(left) & 31));
            int is_min_y = vertex_y == 0 ? 1 : 0;
            int is_max_y = vertex_y == max_coord ? 1 : 0;
            x_adj = (vertex_x & connected_bottom & is_max_y) - (vertex_x & connected_top & is_min_y);
            int is_min_x = vertex_x == 0 ? 1 : 0;
            int is_max_x = vertex_x == max_coord ? 1 : 0;
            y_adj = (vertex_y & connected_left & is_min_x) - (vertex_y & connected_right & is_max_x);
        }
        adjusted_y = vertex_y + y_adj;
        adjusted_x = vertex_x + x_adj;
    }

    // each vertex seems to have an entry in the next section that adjust the vertex position slightly
    // the previously calculated values are then used to calculate the offset into this section
    // which is likely used to make the vertices blend nicer with surrounding vertices
    uint byte_offset;
    if (temp_142 != 0) {
        byte_offset = uint((vertex_x << 2) + (vertex_y << 3) + (quad_index << 4) + page_layout_data.pos_adjust_offset1);
    } else {
        int temp_167 = ((num_verts_per_side & 0xFFFF) * int(uint(num_verts_per_side) >> 16)) & 0xFFFF | num_verts_per_side << 16; // 5 << 16
        int temp_168 = num_verts_per_side << 2; // 5 << 2
        int temp_171 = int(uint(num_verts_per_side) >> 16) * int(uint(temp_167) >> 16); // 0
        int temp_176 = ((temp_171 << 16) + (num_verts_per_side & 0xFFFF) * (num_verts_per_side & 0xFFFF) + (temp_167 << 16)) << 2; // 25 << 2
        int temp_186 = ((temp_176 & 0xFFFF) * int(quad_index >> 16)) & 0xFFFF | quad_index << 16;
        int temp_199 = ((temp_168 & 0xFFFF) * int(uint(adjusted_y) >> 16)) & 0xFFFF | adjusted_y << 16;
        byte_offset = uint(
            (adjusted_x << 2) // groups of 1 u32
            + (temp_168 & 0xFFFF) * (adjusted_y & 0xFFFF) // groups of 5 u32s
            + (temp_176 & 0xFFFF) * (quad_index & 0xFFFF) // groups of 5x5 u32s
            // these next four probably are for other lod levels? should all be 0 for lod0 at least
            + (int(uint(temp_168) >> 16) * int(uint(temp_199) >> 16) << 16) // 0
            + (int(uint(temp_176) >> 16) * int(uint(temp_186) >> 16) << 16) // 0
            + (temp_199 << 16) // 0
            + (temp_186 << 16) // 0
            + page_layout_data.pos_adjust_offset0
        );
    }
    
    int pos_adjust_flags = int(page_file_data.data[int(byte_offset >> 2)]); // 4 byte entries
    int adjust_shift = (int(bitfieldExtract(pos_flags, 18, 5)) + temp_25) & 0x1f;
    // 0xfffe000 = -0x20000 (meaning if all the other terms are 0, the vertex is a [-0.5 * sidelength, -0.5 * sidelength, -0.5 * sidelength])
    // if draw_call_data.pos increases by 1, it shifts over by 1 sidelengths
    // if the pos_flags value increases by 1, it shifts over by 1/32 sidelengths
    // 16, 16, 16 would be the center
    // probably acts as a coarse adjustment
    // if the pos_adjust_flags value increases by 1, it shifts over by 2^(adjust_shift - 18) sidelengths
    // since adjust_shift is between 0 and 31, then that's between 1/262144 sidelengths to 8192 sidelengths (probably doesn't actually cover that range though)
    // probably acts as a fine adjustment
    // adjust_shift seems to be either 4 or 5 which would shift the vertex position by 0.0625 or 0.125 units, respectively
    float x = float(((draw_call_data.pos.x << 5) + int(bitfieldExtract(pos_flags, 0, 6)) << 13) - 0x20000 + (bitfieldExtract(pos_adjust_flags, 0, 11) << adjust_shift));
    float y = float(((draw_call_data.pos.y << 5) + int(bitfieldExtract(pos_flags, 6, 6)) << 13) - 0x20000 + ((bitfieldExtract(pos_adjust_flags, 11, 10) << 1) << adjust_shift));
    float z = float(((draw_call_data.pos.z << 5) + int(bitfieldExtract(pos_flags, 12, 6)) << 13) - 0x20000 + (bitfieldExtract(pos_adjust_flags, 21, 11) << adjust_shift));

    vec3 vertex_pos = vec3(
        x * draw_call_data.sidelength + instance_data.base_pos.x,
        y * draw_call_data.sidelength + instance_data.base_pos.y,
        z * draw_call_data.sidelength + instance_data.base_pos.z
    );

    // gsys_mul_mtx34_vec3(world_pos, instance_data.mtx, vertex_pos);
    vec4 temp = vec4(vertex_pos, 1.0);
    vec3 world_pos = vec3(
        dot(instance_data.mtx[0], temp),
        dot(instance_data.mtx[1], temp),
        dot(instance_data.mtx[2], temp)
    );

    // gsys_mul_mtx34_vec3(view_pos, context.view, world_pos);
    temp = vec4(world_pos, 1.0);
    vec3 view_pos = vec3(
        dot(context.view[0], temp),
        dot(context.view[1], temp),
        dot(context.view[2], temp)
    );

    // gsys_mul_mtx44_vec3(pos_clip_space, context.proj, view_pos);
    temp = vec4(view_pos, 1.0);
    vec4 pos_clip_space = vec4(
        dot(context.proj[0], temp),
        dot(context.proj[1], temp),
        dot(context.proj[2], temp),
        dot(context.proj[3], temp)
    );
    
    out_pos_camera_space = view_pos;

    out_volume_mask_tex_coords.x = (pos_clip_space.w + pos_clip_space.x) * 0.5;
    out_volume_mask_tex_coords.y = (pos_clip_space.w - pos_clip_space.y) * 0.5;
    out_volume_mask_tex_coords.w = pos_clip_space.w;

    out_pos_local = vertex_pos;

    out_mat_flags.y = mat_flags;

    uint temp_247 = uint(quad_index) >> (page_layout_data._20 & 31);
    int temp_266 = (((num_verts_per_side & 0xFFFF) * int(temp_247 >> 16)) & 0xFFFF) | (int(temp_247) << 16);
    int temp_251 = 1 << (page_layout_data._20 & 31);
    int temp_271 = quad_index & (temp_251 + -1);
    uint temp_297 = uint(((num_verts_per_side & 0xFFFF) * int(uint(temp_271) >> 16) & 0xFFFF) | temp_271 << 16);
    precise float temp_310 = float(uint(((int(uint(num_verts_per_side) >> 16) * int(temp_297 >> 16)) << 16) + (num_verts_per_side & 0xFFFF) * (temp_271 & 0xFFFF) + adjusted_x + (temp_297 << 16)));
    precise float temp_287 = float(uint((int(uint(num_verts_per_side) >> 16) * int(uint(temp_266) >> 16) << 16) + (num_verts_per_side & 0xFFFF) * (int(temp_247) & 0xFFFF) + adjusted_y + (temp_266 << 16)));
    out_cave_tex_coords.x = (temp_310 + 0.5) * page_layout_data._24;
    out_cave_tex_coords.y = (temp_287 + 0.5) * page_layout_data._28;

    out_2d_coords.x = float(uint(adjusted_x)) * instance_data.normalize_factor;
    out_2d_coords.y = float(uint(adjusted_y)) * instance_data.normalize_factor;
    
    gl_Position = pos_clip_space;
    return;
}

