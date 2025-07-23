#pragma once

#include "resource_file.h"
#include "octree.h"

#include <filesystem>
#include <format>
#include <fstream>
#include <vector>

using Path = std::filesystem::path;

inline bool ReadFile(const Path path, std::vector<u8>& data) {
    std::ifstream file(path, std::ios::ate | std::ios::binary);

    if (!file.is_open())
        return false;
    
    data.resize(file.tellg());
    file.seekg(0);

    file.read(reinterpret_cast<char*>(data.data()), data.size());

    file.close();

    return true;
}

class ResourceAccessor {
public:
    ResourceAccessor() = default;

    ~ResourceAccessor() {
        mFile = nullptr;
    }

    void setResource(ResCaveResource* file) {
        mFile = file;
    }

    void setPath(const Path& dir_path) {
        mDirPath = dir_path;
    }

    template <typename T>
    const T* getArray(const ResArray<T>* array) const {
        return array->getArray(reinterpret_cast<uintptr_t>(mFile));
    }

    template <typename T>
    const T* getArray(const ResArray<T>& array) const {
        return array.getArray(reinterpret_cast<uintptr_t>(mFile));
    }

    const ResDispMeshInfo* getDispMesh() const {
        return &mFile->disp_mesh;
    }

    const ResChunkMeshInfo* getChunkMesh() const {
        return &mFile->chunk_mesh;
    }

    const ResQuadMeshInfo* getQuadMesh() const {
        return &mFile->quad_mesh;
    }

    s32 calcMaxLod() const {
        return getQuadMesh()->num_far_lod_levels + getQuadMesh()->num_normal_lod_levels - 2;
    }

    f32 calcSidelength(s32 lod) const {
        const s32 max_lod = calcMaxLod();
        const s32 normal_lod = lod - getQuadMesh()->num_far_lod_levels > -1 ? lod - getQuadMesh()->num_far_lod_levels + 1 : 0;
        return (getQuadMesh()->single_bounds.max.x - getQuadMesh()->single_bounds.min.x)
                / (f32)(1 << max_lod)
                * (f32)(1 << (max_lod - (lod - normal_lod)))
                / (f32)(1 << 18);
    }

    void loadQuadFile(u32 id, std::vector<u8>& data) {
        const Path path = mDirPath / Path(std::format("Full/C.crbin.517a15eb/{:06d}.quad", id));
        ReadFile(path, data);
    }

private:
    ResCaveResource* mFile;
    Path mDirPath;
};

class QuadReader {
public:
    QuadReader() = delete;

    QuadReader(const Path& dir_path, const Path& out_path) : mOutputDir(out_path.string()) {
        ReadFile(dir_path / "Full/C.crbin", mFileData);

        genIndexBuffer();

        mAccessor.setResource(reinterpret_cast<ResCaveResource*>(mFileData.data()));
        mAccessor.setPath(dir_path);

        // genOctree();
    }

    struct Triangle {
        s32 a, b, c;
    };

    struct QuadData {
        std::vector<Vec3f> vertices;
        std::vector<Triangle> triangles;
    };

    void dumpObjFiles();

private:
    Vec3f processVertex(const u32* page_file_data, u32 index, const ResNode* node, const ResPageFileLayout* layout, const Vec3f& base, f32 sidelength);
    void genIndexBuffer();
    // void genOctree();

    void writeFile(const Path& filename, std::vector<QuadData>& quad_data) const;

    ResourceAccessor mAccessor;
    Path mOutputDir;
    std::vector<u8> mFileData;
    std::vector<u32> mIndexBuffer;
    // std::vector<u32> mNodeMasks;
    // Octree mOctree;
    // Octree mPrevOctree;
};