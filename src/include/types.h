#pragma once

#include <cstdint>
#include <cstdarg>
#include <limits>

using u8 = std::uint8_t;
using u16 = std::uint16_t;
using u32 = std::uint32_t;
using u64 = std::uint64_t;

using s8 = std::int8_t;
using s16 = std::int16_t;
using s32 = std::int32_t;
using s64 = std::int64_t;

using size_t = std::size_t;

using f32 = float;
using f64 = double;

template <typename T>
struct Vec3 {
    T x, y, z;

    Vec3() : x{0}, y{0}, z{0} {}

    Vec3(T x0, T y0, T z0) : x{x0}, y{y0}, z{z0} {}

    T dot(const Vec3<T>& other) {
        return this->x * other.x + this->y * other.y + this->z * other.z;
    }
};

template <typename T>
struct Vec4 {
    T x, y, z, w;

    Vec4() : x{0}, y{0}, z{0}, w{0} {}

    Vec4(T x0, T y0, T z0, T w0) : x{x0}, y{y0}, z{z0}, w{w0} {}

    Vec4(const Vec3<T>& base, T w0) {
        x = base.x; y = base.y; z = base.z; w = w0;
    }

    Vec3<T> asVec3() const {
        return Vec3<T>(x, y, z);
    }

    T dot(const Vec4<T>& other) {
        return this->x * other.x + this->y * other.y + this->z * other.z + this->w * other.w;
    }
};

using Vec3f = Vec3<f32>;
using Vec3i = Vec3<s32>;
using Vec4f = Vec4<f32>;
using Vec4i = Vec4<s32>;

template <typename T>
struct BoundBox3 {
    Vec3<T> min, max;

    BoundBox3() {
        min = Vec3(std::numeric_limits<T>::max(), std::numeric_limits<T>::max(), std::numeric_limits<T>::max());
        max = Vec3(std::numeric_limits<T>::min(), std::numeric_limits<T>::min(), std::numeric_limits<T>::min());
    }

    BoundBox3(T min_x, T min_y, T min_z, T max_x, T max_y, T max_z) {
        min = Vec3<T>(min_x, min_y, min_z);
        max = Vec3<T>(max_x, max_y, max_z);
    }

    BoundBox3(Vec3<T> min0, Vec3<T> max0) {
        min = min0;
        max = max0;
    }

    T getSizeX() const {
        return max.x - min.x;
    }

    T getSizeY() const {
        return max.y - min.y;
    }

    T getSizeZ() const {
        return max.z - min.z;
    }
};

using BoundBox3f = BoundBox3<f32>;
using BoundBox3i = BoundBox3<s32>;

struct Matrix34f {
    Vec4f r1, r2, r3;
};