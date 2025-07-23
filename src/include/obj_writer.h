#pragma once

#include "types.h"

#include <filesystem>
#include <format>
#include <fstream>
#include <string>

class ObjWriter {
public:
    ObjWriter() = delete;

    explicit ObjWriter(const std::string& path) : mOutputStream(path) {
        std::filesystem::create_directories(std::filesystem::path(path).parent_path());
    }
    explicit ObjWriter(const std::filesystem::path& path) : mOutputStream(path) {
        std::filesystem::create_directories(path.parent_path());
    }

    void writeVertex(const Vec3f& pos) {
        const std::string line = std::format("v {} {} {}\n", pos.x, pos.y, pos.z);
        mOutputStream.write(line.c_str(), line.size());
    }
    
    void writeFace(s32 a, s32 b, s32 c) {
        const std::string line = std::format("f {} {} {}\n", a, b, c);
        mOutputStream.write(line.c_str(), line.size());
    }

private:
    std::ofstream mOutputStream;
};