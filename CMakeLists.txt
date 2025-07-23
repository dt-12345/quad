CMAKE_MINIMUM_REQUIRED(VERSION 3.15)

project(Quad CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)

add_executable(quad
    src/include/types.h

    src/include/obj_writer.h
    src/include/octree.h
    src/include/quad_reader.h
    src/include/resource_file.h

    src/octree.cpp
    src/quad_reader.cpp

    src/main.cpp
)

target_include_directories(quad PRIVATE src/include)

if (MSVC)
    target_compile_options(quad PRIVATE /W4 /wd4244 /wd4127 /Zc:__cplusplus)
else()
    target_compile_options(quad PRIVATE -Wall -Wextra -fno-plt)
endif()

if (MINGW)
    target_link_options(quad PRIVATE -static-libgcc -static-libstdc++ --static)
endif()