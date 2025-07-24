#include "quad_reader.h"

#include <cstring>

const std::string ParseInput(int argc, char** argv, int index) {
    if (argc < 2 + index)
        return "";

    size_t size = strnlen(argv[1 + index], 0x1000);
    std::string value{argv[1 + index], argv[1 + index] + size};
    return value;
}

int main(int argc, char** argv) {
    Path minus_field_dir = ParseInput(argc, argv, 0);
    Path out_dir = ParseInput(argc, argv, 1);

    QuadReader reader{minus_field_dir, out_dir};

    reader.dumpObjFiles();
}