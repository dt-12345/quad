#version 450 core
#extension GL_ARB_gpu_shader_int64 : enable
#extension GL_ARB_shader_ballot : enable
#extension GL_ARB_shader_group_vote : enable
#extension GL_EXT_shader_image_load_formatted : enable
#extension GL_EXT_texture_shadow_lod : enable
#extension GL_ARB_fragment_shader_interlock : enable
#extension GL_NV_viewport_array2 : enable
#pragma optionNV(fastmath off)

const int undef = 0;

layout (binding = 0, std140) uniform _support_buffer
{
    uint alpha_test;
    uint is_bgra[8];
    precise vec4 viewport_inverse;
    precise vec4 viewport_size;
    int frag_scale_count;
    precise float render_scale[73];
    ivec4 tfe_offset;
    int tfe_vertex_count;
} support_buffer;

/* cave_StaticDataUBO */
layout (binding = 15, std140) uniform _gsys_user0
{
    precise vec4 data[4096];
} static_data_ubo; // gsys_user0

/* Context */
layout (binding = 5, std140) uniform _gsys_context
{
    precise vec4 data[4096];
} gsys_context; // gsys_context

/* SceneMat */
layout (binding = 14, std140) uniform _gsys_scene_material
{
    precise vec4 data[4096];
} gsys_scene_material; // gsys_scene_material

/* Env */
layout (binding = 10, std140) uniform _gsys_environment
{
    precise vec4 data[4096];
} gsys_environment; // gsys_environment

layout (binding = 2, std140) uniform _fp_c1
{
    precise vec4 data[4096];
} fp_c1;

/* Mat */
layout (binding = 12, std140) uniform _gsys_material
{
    precise vec4 data[4096];
} gsys_material; // gsys_material

layout (binding = 0) uniform sampler2D cCaveQuadMeshNormals; // cave_qm_normals
layout (binding = 1) uniform sampler2D cCaveQuadMeshMaterialWeights_Ao; // cave_qm_material_weights_ao
layout (binding = 2) uniform sampler2D cCaveMaterialWeightsDetail; // cave_material_weights_detail
layout (binding = 3) uniform sampler2D cTex_SkyIslandShadow; // gsys_projection1
layout (binding = 4) uniform sampler2D cTex_VolumeMask; // gsys_user2
layout (binding = 5) uniform sampler2D cTex_WorldShadowHeight; // gsys_depth_shadow_quarter
layout (binding = 6) uniform sampler2D cTex_MinusFieldLightMap; // gsys_depth_shadow_half
layout (binding = 7) uniform sampler2D cTex_MinusFieldDarkness; // gsys_gbuffer_shadow
layout (binding = 8) uniform sampler2DArray cTexture1; // _s0 => MaterialCmb
layout (binding = 9) uniform sampler2DArray cTexture0; // _a0 => MaterialAlb
layout (binding = 10) uniform sampler2DArrayShadow cTex_DepthShadowCascade; // gsys_depth_shadow_cascade
layout (binding = 11) uniform samplerCube cTex_CubeEnvMap; // gsys_cube_map
layout (binding = 12) uniform sampler2D cTex_Projection0; // gsys_projection0
layout (binding = 13) uniform sampler2D cTex_SkyInscatter; // gsys_user0

layout (location = 0) in vec3 in_pos_camera_space;
layout (location = 1) in vec4 in_volume_mask_tex_coords;
layout (location = 2) in vec3 in_pos_local;
layout (location = 3) flat in uvec4 in_mat_flags;
layout (location = 4) in vec4 in_cave_tex_coords;
layout (location = 5) in vec2 in_2d_coords;

layout (location = 0) out vec4 out_color;

int TextureSizeUnscale(int a0, int a1);
int TexelFetchScale(int a0, int a1, int a2);

int TextureSizeUnscale(int a0, int a1)
{
    int temp_0;
    precise float temp_1;
    precise float temp_2;
    bool temp_3;
    precise float temp_4;
    precise float temp_5;
    int temp_6;
    temp_0 = 1 + a1;
    temp_1 = support_buffer.render_scale[temp_0];
    temp_2 = abs(temp_1);
    temp_3 = temp_2 == 1.0;
    if (temp_3)
    {
        return a0;
    }
    temp_4 = float(a0);
    temp_5 = temp_4 / temp_2;
    temp_6 = int(temp_5);
    return temp_6;
}

int TexelFetchScale(int a0, int a1, int a2)
{
    int temp_7;
    precise float temp_8;
    bool temp_9;
    bool temp_10;
    precise float temp_11;
    precise float temp_12;
    precise float temp_13;
    precise float temp_14;
    precise float temp_15;
    precise float temp_16;
    precise float temp_17;
    precise float temp_18;
    int temp_19;
    precise float temp_20;
    precise float temp_21;
    int temp_22;
    temp_7 = 1 + a1;
    temp_8 = support_buffer.render_scale[temp_7];
    temp_9 = temp_8 == 1.0;
    if (temp_9)
    {
        return a0;
    }
    temp_10 = temp_8 < 0.0;
    if (temp_10)
    {
        temp_11 = 0.0 - temp_8;
        temp_12 = float(a0);
        temp_13 = temp_12 * temp_11;
        temp_14 = gl_FragCoord.x;
        temp_15 = gl_FragCoord.y;
        temp_16 = (a2 != 0) ? temp_15 : temp_14;
        temp_17 = mod(temp_16, temp_11);
        temp_18 = temp_13 + temp_17;
        temp_19 = int(temp_18);
        return temp_19;
    }
    temp_20 = float(a0);
    temp_21 = temp_20 * temp_8;
    temp_22 = int(temp_21);
    return temp_22;
}

void main()
{
    int temp_23;
    int temp_24;
    int temp_25;
    int temp_26;
    int temp_27;
    int temp_28;
    int temp_29;
    int temp_30;
    precise float temp_31;
    precise float temp_32;
    precise float temp_33;
    precise float temp_34;
    precise float temp_35;
    precise float temp_36;
    precise float temp_37;
    precise float temp_38;
    precise float temp_39;
    precise float temp_40;
    precise float temp_41;
    precise float temp_42;
    precise float temp_43;
    precise float temp_44;
    precise float temp_45;
    precise float temp_46;
    precise float temp_47;
    precise float temp_48;
    precise float temp_49;
    precise float temp_50;
    precise float temp_51;
    precise float temp_52;
    precise float temp_53;
    precise float temp_54;
    precise float temp_55;
    precise float temp_56;
    precise float temp_57;
    precise float temp_58;
    precise float temp_59;
    precise float temp_60;
    precise float temp_61;
    precise float temp_62;
    precise float temp_63;
    precise float temp_64;
    precise float temp_65;
    precise float temp_66;
    precise float temp_67;
    precise float temp_68;
    precise float temp_69;
    precise float temp_70;
    precise float temp_71;
    precise float temp_72;
    precise float temp_73;
    precise float temp_74;
    precise float temp_75;
    precise float temp_76;
    precise float temp_77;
    precise float temp_78;
    bool temp_79;
    precise float temp_80;
    precise float temp_81;
    precise float temp_82;
    precise float temp_83;
    bool temp_84;
    bool temp_85;
    precise float temp_86;
    precise float temp_87;
    precise float temp_88;
    precise float temp_89;
    bool temp_90;
    bool temp_91;
    bool temp_92;
    bool temp_93;
    precise float temp_94;
    precise float temp_95;
    precise float temp_96;
    precise float temp_97;
    precise float temp_98;
    precise float temp_99;
    precise float temp_100;
    int temp_101;
    precise float temp_102;
    precise float temp_103;
    int temp_104;
    precise float temp_105;
    int temp_106;
    precise float temp_107;
    precise float temp_108;
    int temp_109;
    precise float temp_110;
    precise float temp_111;
    precise float temp_112;
    precise float temp_113;
    int temp_114;
    int temp_115;
    precise vec3 temp_116;
    precise float temp_117;
    precise float temp_118;
    precise float temp_119;
    int temp_120;
    int temp_121;
    precise vec3 temp_122;
    precise float temp_123;
    precise float temp_124;
    precise float temp_125;
    int temp_126;
    int temp_127;
    precise vec3 temp_128;
    precise float temp_129;
    precise float temp_130;
    precise float temp_131;
    int temp_132;
    int temp_133;
    precise vec3 temp_134;
    precise float temp_135;
    precise float temp_136;
    precise float temp_137;
    int temp_138;
    int temp_139;
    precise vec3 temp_140;
    precise float temp_141;
    precise float temp_142;
    precise float temp_143;
    int temp_144;
    int temp_145;
    precise vec3 temp_146;
    precise float temp_147;
    precise float temp_148;
    precise float temp_149;
    int temp_150;
    int temp_151;
    precise vec3 temp_152;
    precise float temp_153;
    precise float temp_154;
    precise float temp_155;
    precise vec4 temp_156;
    precise float temp_157;
    precise float temp_158;
    precise float temp_159;
    precise float temp_160;
    int temp_161;
    int temp_162;
    precise vec3 temp_163;
    precise float temp_164;
    precise float temp_165;
    precise float temp_166;
    precise float temp_167;
    precise vec3 temp_168;
    precise float temp_169;
    precise float temp_170;
    precise float temp_171;
    precise vec4 temp_172;
    precise float temp_173;
    precise float temp_174;
    precise float temp_175;
    precise float temp_176;
    precise float temp_177;
    precise float temp_178;
    precise float temp_179;
    precise float temp_180;
    precise float temp_181;
    precise float temp_182;
    precise float temp_183;
    precise float temp_184;
    precise float temp_185;
    bool temp_186;
    bool temp_187;
    bool temp_188;
    precise float temp_189;
    precise float temp_190;
    precise float temp_191;
    precise float temp_192;
    precise float temp_193;
    precise float temp_194;
    precise float temp_195;
    precise float temp_196;
    precise float temp_197;
    precise float temp_198;
    precise float temp_199;
    precise float temp_200;
    bool temp_201;
    precise float temp_202;
    precise float temp_203;
    precise float temp_204;
    precise float temp_205;
    precise float temp_206;
    precise float temp_207;
    precise float temp_208;
    precise float temp_209;
    precise float temp_210;
    precise float temp_211;
    precise float temp_212;
    precise float temp_213;
    precise float temp_214;
    precise float temp_215;
    precise float temp_216;
    precise float temp_217;
    precise float temp_218;
    precise float temp_219;
    precise float temp_220;
    precise float temp_221;
    precise float temp_222;
    precise float temp_223;
    precise float temp_224;
    precise float temp_225;
    precise float temp_226;
    precise float temp_227;
    precise float temp_228;
    precise float temp_229;
    precise float temp_230;
    precise float temp_231;
    precise float temp_232;
    precise float temp_233;
    precise float temp_234;
    precise float temp_235;
    uint material_flags;
    precise float temp_237;
    precise float temp_238;
    precise float temp_239;
    precise float temp_240;
    precise float temp_241;
    precise float temp_242;
    precise float temp_243;
    precise float temp_244;
    precise float temp_245;
    precise float temp_246;
    precise float temp_247;
    precise float temp_248;
    precise float temp_249;
    bool temp_250;
    precise float temp_251;
    precise float temp_252;
    precise float temp_253;
    bool temp_254;
    precise float temp_255;
    uint temp_256;
    precise float temp_257;
    precise float temp_258;
    precise float temp_259;
    precise float temp_260;
    precise float temp_261;
    precise float temp_262;
    precise float temp_263;
    precise float temp_264;
    precise float temp_265;
    precise float temp_266;
    precise float temp_267;
    precise float temp_268;
    precise float temp_269;
    precise float temp_270;
    uint temp_271;
    int temp_272;
    precise float temp_273;
    precise float temp_274;
    precise float temp_275;
    int temp_276;
    precise float temp_277;
    precise float temp_278;
    precise float temp_279;
    precise float temp_280;
    precise float temp_281;
    precise float temp_282;
    precise float temp_283;
    precise float temp_284;
    precise float temp_285;
    precise float temp_286;
    precise float temp_287;
    precise float temp_288;
    precise float temp_289;
    precise float temp_290;
    precise float temp_291;
    precise float temp_292;
    precise float temp_293;
    precise float temp_294;
    precise float temp_295;
    precise float temp_296;
    precise float temp_297;
    precise float temp_298;
    precise float temp_299;
    precise float temp_300;
    precise float temp_301;
    precise float temp_302;
    precise float temp_303;
    precise float temp_304;
    precise float temp_305;
    precise float temp_306;
    precise float temp_307;
    precise float temp_308;
    precise float temp_309;
    precise float temp_310;
    precise float temp_311;
    precise float temp_312;
    precise float temp_313;
    precise float temp_314;
    precise float temp_315;
    precise float temp_316;
    precise float temp_317;
    precise float temp_318;
    precise float temp_319;
    precise float temp_320;
    precise float temp_321;
    precise float temp_322;
    precise float temp_323;
    precise float temp_324;
    precise float temp_325;
    precise float temp_326;
    precise float temp_327;
    precise float temp_328;
    precise float temp_329;
    precise float temp_330;
    uint temp_331;
    precise float temp_332;
    uint temp_333;
    precise float temp_334;
    int temp_335;
    int temp_336;
    int temp_337;
    precise float temp_338;
    precise float temp_339;
    precise float temp_340;
    int temp_341;
    int temp_342;
    int temp_343;
    int temp_344;
    int temp_345;
    int temp_346;
    precise float temp_347;
    uint temp_348;
    int temp_349;
    int temp_350;
    int temp_351;
    precise float temp_352;
    precise float temp_353;
    precise float temp_354;
    precise float temp_355;
    int temp_356;
    int temp_357;
    int temp_358;
    precise float temp_359;
    precise float temp_360;
    precise float temp_361;
    precise float temp_362;
    precise float temp_363;
    precise float temp_364;
    precise float temp_365;
    precise float temp_366;
    int temp_367;
    precise float temp_368;
    int temp_369;
    int temp_370;
    int temp_371;
    int temp_372;
    precise float temp_373;
    int temp_374;
    int temp_375;
    int temp_376;
    int temp_377;
    int temp_378;
    int temp_379;
    int temp_380;
    int temp_381;
    int temp_382;
    int temp_383;
    int temp_384;
    int temp_385;
    int temp_386;
    precise float temp_387;
    precise float temp_388;
    precise float temp_389;
    int temp_390;
    int temp_391;
    precise float temp_392;
    precise float temp_393;
    precise float temp_394;
    precise float temp_395;
    precise float temp_396;
    precise float temp_397;
    int temp_398;
    int temp_399;
    int temp_400;
    int temp_401;
    int temp_402;
    int temp_403;
    int temp_404;
    int temp_405;
    int temp_406;
    int temp_407;
    int temp_408;
    int temp_409;
    precise float temp_410;
    precise float temp_411;
    int temp_412;
    precise float temp_413;
    precise float temp_414;
    int temp_415;
    precise float temp_416;
    precise float temp_417;
    precise float temp_418;
    precise float temp_419;
    precise float temp_420;
    uint temp_421;
    precise float temp_422;
    uint temp_423;
    precise float temp_424;
    precise float temp_425;
    precise float temp_426;
    precise float temp_427;
    precise float temp_428;
    precise float temp_429;
    precise float temp_430;
    precise float temp_431;
    int temp_432;
    precise float temp_433;
    precise float temp_434;
    precise float temp_435;
    precise float temp_436;
    uint temp_437;
    int temp_438;
    int temp_439;
    int temp_440;
    int temp_441;
    int temp_442;
    precise float temp_443;
    uint temp_444;
    int temp_445;
    uint temp_446;
    precise float temp_447;
    uint temp_448;
    uint temp_449;
    uint temp_450;
    precise float temp_451;
    bool temp_452;
    bool temp_453;
    bool temp_454;
    precise float temp_455;
    precise float temp_456;
    precise float temp_457;
    precise float temp_458;
    precise float temp_459;
    precise float temp_460;
    precise float temp_461;
    precise float temp_462;
    precise float temp_463;
    precise float temp_464;
    precise float temp_465;
    precise float temp_466;
    precise float temp_467;
    precise float temp_468;
    precise float temp_469;
    precise float temp_470;
    precise float temp_471;
    precise float temp_472;
    precise float temp_473;
    precise float temp_474;
    uint temp_475;
    precise float temp_476;
    uint temp_477;
    precise float temp_478;
    uint temp_479;
    uint temp_480;
    precise float temp_481;
    precise float temp_482;
    precise float temp_483;
    precise float temp_484;
    precise float temp_485;
    precise float temp_486;
    precise float temp_487;
    precise float temp_488;
    precise float temp_489;
    precise float temp_490;
    precise float temp_491;
    precise float temp_492;
    precise float temp_493;
    precise float temp_494;
    bool temp_495;
    precise float temp_496;
    precise float temp_497;
    precise float temp_498;
    precise float temp_499;
    precise float temp_500;
    precise float temp_501;
    precise float temp_502;
    precise float temp_503;
    precise float temp_504;
    precise float temp_505;
    precise float temp_506;
    precise float temp_507;
    precise float temp_508;
    precise float temp_509;
    precise float temp_510;
    precise float temp_511;
    precise float temp_512;
    precise float temp_513;
    precise float temp_514;
    precise float temp_515;
    int temp_516;
    precise float temp_517;
    precise float temp_518;
    precise float temp_519;
    precise float temp_520;
    int temp_521;
    precise float temp_522;
    precise float temp_523;
    precise float temp_524;
    int temp_525;
    uint temp_526;
    uint temp_527;
    int temp_528;
    precise float temp_529;
    int temp_530;
    int temp_531;
    uint temp_532;
    uint temp_533;
    int temp_534;
    precise float temp_535;
    uint temp_536;
    int temp_537;
    uint temp_538;
    uint temp_539;
    int temp_540;
    precise float temp_541;
    int temp_542;
    precise float temp_543;
    precise float temp_544;
    uint temp_545;
    uint temp_546;
    int temp_547;
    precise float temp_548;
    precise float temp_549;
    uint temp_550;
    uint temp_551;
    int temp_552;
    int temp_553;
    int temp_554;
    int temp_555;
    precise float temp_556;
    precise float temp_557;
    uint temp_558;
    uint temp_559;
    int temp_560;
    int temp_561;
    int temp_562;
    int temp_563;
    precise float temp_564;
    precise float temp_565;
    precise vec3 temp_566;
    precise float temp_567;
    precise float temp_568;
    precise float temp_569;
    precise float temp_570;
    precise float temp_571;
    precise float temp_572;
    precise float temp_573;
    precise vec3 temp_574;
    precise float temp_575;
    precise float temp_576;
    precise float temp_577;
    precise vec3 temp_578;
    precise float temp_579;
    precise float temp_580;
    precise float temp_581;
    precise vec3 temp_582;
    precise float temp_583;
    precise float temp_584;
    precise float temp_585;
    precise vec3 temp_586;
    precise float temp_587;
    precise float temp_588;
    precise float temp_589;
    precise vec3 temp_590;
    precise float temp_591;
    precise float temp_592;
    precise float temp_593;
    precise float temp_594;
    precise float temp_595;
    precise float temp_596;
    precise float temp_597;
    precise float temp_598;
    precise float temp_599;
    precise float temp_600;
    int temp_601;
    int temp_602;
    int temp_603;
    int temp_604;
    int temp_605;
    int temp_606;
    int temp_607;
    int temp_608;
    int temp_609;
    int temp_610;
    int temp_611;
    int temp_612;
    precise float temp_613;
    int temp_614;
    int temp_615;
    int temp_616;
    int temp_617;
    precise float temp_618;
    precise float temp_619;
    precise float temp_620;
    precise float temp_621;
    precise float temp_622;
    precise float temp_623;
    precise float temp_624;
    precise float temp_625;
    precise float temp_626;
    precise float temp_627;
    precise float temp_628;
    precise float temp_629;
    precise float temp_630;
    precise float temp_631;
    precise float temp_632;
    precise float temp_633;
    precise float temp_634;
    precise float temp_635;
    precise float temp_636;
    precise float temp_637;
    precise float temp_638;
    precise float temp_639;
    precise float temp_640;
    precise float temp_641;
    precise float temp_642;
    precise float temp_643;
    precise float temp_644;
    precise float temp_645;
    precise float temp_646;
    precise float temp_647;
    precise float temp_648;
    precise float temp_649;
    precise float temp_650;
    precise float temp_651;
    precise float temp_652;
    precise float temp_653;
    precise float temp_654;
    precise float temp_655;
    precise float temp_656;
    precise float temp_657;
    precise float temp_658;
    precise float temp_659;
    precise float temp_660;
    precise float temp_661;
    precise float temp_662;
    precise float temp_663;
    precise float temp_664;
    precise float temp_665;
    precise float temp_666;
    precise float temp_667;
    precise float temp_668;
    precise float temp_669;
    precise float temp_670;
    precise float temp_671;
    precise float temp_672;
    precise float temp_673;
    precise float temp_674;
    precise float temp_675;
    precise float temp_676;
    precise float temp_677;
    precise float temp_678;
    precise float temp_679;
    precise float temp_680;
    precise float temp_681;
    precise float temp_682;
    precise float temp_683;
    precise float temp_684;
    precise float temp_685;
    precise float temp_686;
    precise float temp_687;
    precise float temp_688;
    precise float temp_689;
    precise float temp_690;
    precise float temp_691;
    precise float temp_692;
    precise float temp_693;
    precise float temp_694;
    precise float temp_695;
    precise float temp_696;
    precise float temp_697;
    precise float temp_698;
    precise float temp_699;
    precise float temp_700;
    precise float temp_701;
    int temp_702;
    int temp_703;
    int temp_704;
    int temp_705;
    precise float temp_706;
    precise float temp_707;
    precise float temp_708;
    precise float temp_709;
    precise float temp_710;
    precise float temp_711;
    precise float temp_712;
    int temp_713;
    int temp_714;
    int temp_715;
    int temp_716;
    int temp_717;
    int temp_718;
    int temp_719;
    int temp_720;
    precise float temp_721;
    precise float temp_722;
    precise float temp_723;
    int temp_724;
    int temp_725;
    int temp_726;
    int temp_727;
    precise float temp_728;
    precise float temp_729;
    precise float temp_730;
    precise float temp_731;
    precise float temp_732;
    precise float temp_733;
    precise float temp_734;
    precise float temp_735;
    bool temp_736;
    uint temp_737;
    precise float temp_738;
    precise float temp_739;
    uint temp_740;
    precise float temp_741;
    precise float temp_742;
    uint temp_743;
    precise float temp_744;
    precise float temp_745;
    int temp_746;
    precise float temp_747;
    precise float temp_748;
    precise float temp_749;
    int temp_750;
    uint temp_751;
    uint temp_752;
    int temp_753;
    precise float temp_754;
    int temp_755;
    precise float temp_756;
    precise float temp_757;
    uint temp_758;
    uint temp_759;
    uint temp_760;
    int temp_761;
    uint temp_762;
    uint temp_763;
    int temp_764;
    precise float temp_765;
    int temp_766;
    precise float temp_767;
    precise float temp_768;
    int temp_769;
    int temp_770;
    int temp_771;
    int temp_772;
    int temp_773;
    int temp_774;
    int temp_775;
    int temp_776;
    int temp_777;
    int temp_778;
    int temp_779;
    int temp_780;
    int temp_781;
    int temp_782;
    int temp_783;
    int temp_784;
    int temp_785;
    int temp_786;
    int temp_787;
    int temp_788;
    int temp_789;
    int temp_790;
    int temp_791;
    precise float temp_792;
    precise float temp_793;
    int temp_794;
    int temp_795;
    int temp_796;
    int temp_797;
    int temp_798;
    int temp_799;
    int temp_800;
    int temp_801;
    int temp_802;
    int temp_803;
    int temp_804;
    int temp_805;
    int temp_806;
    int temp_807;
    int temp_808;
    int temp_809;
    int temp_810;
    int temp_811;
    int temp_812;
    int temp_813;
    int temp_814;
    int temp_815;
    int temp_816;
    int temp_817;
    int temp_818;
    int temp_819;
    int temp_820;
    int temp_821;
    precise float temp_822;
    precise float temp_823;
    precise float temp_824;
    precise float temp_825;
    precise float temp_826;
    precise float temp_827;
    precise float temp_828;
    precise float temp_829;
    precise float temp_830;
    precise float temp_831;
    precise float temp_832;
    precise float temp_833;
    precise float temp_834;
    precise float temp_835;
    precise float temp_836;
    precise float temp_837;
    precise float temp_838;
    precise float temp_839;
    precise float temp_840;
    precise float temp_841;
    precise float temp_842;
    precise float temp_843;
    precise float temp_844;
    precise float temp_845;
    precise float temp_846;
    precise float temp_847;
    precise float temp_848;
    precise float temp_849;
    precise float temp_850;
    precise float temp_851;
    precise float temp_852;
    precise float temp_853;
    int temp_854;
    precise vec3 temp_855;
    precise float temp_856;
    precise float temp_857;
    precise float temp_858;
    int temp_859;
    precise vec3 temp_860;
    precise float temp_861;
    precise float temp_862;
    precise float temp_863;
    int temp_864;
    precise vec3 temp_865;
    precise float temp_866;
    precise float temp_867;
    precise float temp_868;
    int temp_869;
    precise vec3 temp_870;
    precise float temp_871;
    precise float temp_872;
    precise float temp_873;
    precise float temp_874;
    precise float temp_875;
    precise float temp_876;
    precise float temp_877;
    precise float temp_878;
    precise float temp_879;
    precise float temp_880;
    precise float temp_881;
    precise float temp_882;
    precise float temp_883;
    precise float temp_884;
    precise float temp_885;
    precise float temp_886;
    precise float temp_887;
    precise float temp_888;
    precise float temp_889;
    precise float temp_890;
    precise float temp_891;
    precise float temp_892;
    precise float temp_893;
    precise float temp_894;
    precise float temp_895;
    precise float temp_896;
    precise float temp_897;
    precise float temp_898;
    precise float temp_899;
    precise float temp_900;
    precise float temp_901;
    int temp_902;
    int temp_903;
    int temp_904;
    int temp_905;
    int temp_906;
    int temp_907;
    int temp_908;
    int temp_909;
    precise float temp_910;
    precise float temp_911;
    precise float temp_912;
    precise float temp_913;
    precise float temp_914;
    precise float temp_915;
    int temp_916;
    int temp_917;
    int temp_918;
    int temp_919;
    int temp_920;
    precise float temp_921;
    int temp_922;
    int temp_923;
    int temp_924;
    int temp_925;
    precise float temp_926;
    precise float temp_927;
    precise float temp_928;
    precise float temp_929;
    precise float temp_930;
    precise float temp_931;
    int temp_932;
    int temp_933;
    precise float temp_934;
    int temp_935;
    int temp_936;
    precise float temp_937;
    precise float temp_938;
    precise float temp_939;
    precise float temp_940;
    precise float temp_941;
    precise float temp_942;
    precise float temp_943;
    int temp_944;
    int temp_945;
    precise float temp_946;
    precise float temp_947;
    int temp_948;
    int temp_949;
    int temp_950;
    int temp_951;
    precise float temp_952;
    precise float temp_953;
    precise float temp_954;
    int temp_955;
    precise float temp_956;
    precise float temp_957;
    precise float temp_958;
    int temp_959;
    int temp_960;
    int temp_961;
    int temp_962;
    precise float temp_963;
    precise float temp_964;
    uint temp_965;
    uint temp_966;
    int temp_967;
    int temp_968;
    precise float temp_969;
    precise float temp_970;
    precise float temp_971;
    precise float temp_972;
    precise float temp_973;
    precise float temp_974;
    precise float temp_975;
    precise float temp_976;
    precise float temp_977;
    int temp_978;
    precise vec3 temp_979;
    precise float temp_980;
    precise float temp_981;
    precise float temp_982;
    precise float temp_983;
    int temp_984;
    precise vec3 temp_985;
    precise float temp_986;
    precise float temp_987;
    precise float temp_988;
    int temp_989;
    precise vec3 temp_990;
    precise float temp_991;
    precise float temp_992;
    precise float temp_993;
    int temp_994;
    precise vec3 temp_995;
    precise float temp_996;
    precise float temp_997;
    precise float temp_998;
    precise float temp_999;
    precise float temp_1000;
    precise float temp_1001;
    precise float temp_1002;
    precise float temp_1003;
    precise float temp_1004;
    int temp_1005;
    int temp_1006;
    int temp_1007;
    int temp_1008;
    int temp_1009;
    int temp_1010;
    int temp_1011;
    int temp_1012;
    precise float temp_1013;
    precise float temp_1014;
    precise float temp_1015;
    precise float temp_1016;
    precise float temp_1017;
    precise float temp_1018;
    precise float temp_1019;
    precise float temp_1020;
    precise float temp_1021;
    precise float temp_1022;
    precise float temp_1023;
    precise float temp_1024;
    precise float temp_1025;
    precise float temp_1026;
    precise float temp_1027;
    precise float temp_1028;
    precise float temp_1029;
    precise float temp_1030;
    precise float temp_1031;
    precise float temp_1032;
    precise float temp_1033;
    precise float temp_1034;
    precise float temp_1035;
    precise float temp_1036;
    precise float temp_1037;
    precise float temp_1038;
    precise float temp_1039;
    int temp_1040;
    int temp_1041;
    int temp_1042;
    precise float temp_1043;
    int temp_1044;
    int temp_1045;
    precise float temp_1046;
    precise float temp_1047;
    precise float temp_1048;
    int temp_1049;
    int temp_1050;
    int temp_1051;
    int temp_1052;
    precise float temp_1053;
    precise float temp_1054;
    precise float temp_1055;
    precise float temp_1056;
    precise float temp_1057;
    precise float temp_1058;
    precise float temp_1059;
    precise float temp_1060;
    precise float temp_1061;
    precise float temp_1062;
    precise float temp_1063;
    precise float temp_1064;
    precise float temp_1065;
    int temp_1066;
    precise float temp_1067;
    precise float temp_1068;
    int temp_1069;
    int temp_1070;
    precise float temp_1071;
    int temp_1072;
    int temp_1073;
    int temp_1074;
    int temp_1075;
    int temp_1076;
    int temp_1077;
    precise float temp_1078;
    precise float temp_1079;
    precise float temp_1080;
    precise float temp_1081;
    precise float temp_1082;
    precise float temp_1083;
    precise float temp_1084;
    precise float temp_1085;
    precise float temp_1086;
    precise float temp_1087;
    precise float temp_1088;
    precise float temp_1089;
    precise float temp_1090;
    precise float temp_1091;
    precise float temp_1092;
    precise float temp_1093;
    precise float temp_1094;
    precise float temp_1095;
    precise float temp_1096;
    precise float temp_1097;
    precise float temp_1098;
    precise float temp_1099;
    precise float temp_1100;
    precise float temp_1101;
    precise float temp_1102;
    bool temp_1103;
    precise float temp_1104;
    int temp_1105;
    precise float temp_1106;
    bool temp_1107;
    int temp_1108;
    precise float temp_1109;
    bool temp_1110;
    int temp_1111;
    bool temp_1112;
    bool temp_1113;
    precise float temp_1114;
    int temp_1115;
    precise float temp_1116;
    precise float temp_1117;
    precise float temp_1118;
    precise float temp_1119;
    precise float temp_1120;
    precise float temp_1121;
    int temp_1122;
    int temp_1123;
    precise float temp_1124;
    precise float temp_1125;
    precise float temp_1126;
    precise float temp_1127;
    precise float temp_1128;
    bool temp_1129;
    bool temp_1130;
    bool temp_1131;
    bool temp_1132;
    int temp_1133;
    precise float temp_1134;
    int temp_1135;
    precise float temp_1136;
    precise float temp_1137;
    precise float temp_1138;
    int temp_1139;
    int temp_1140;
    int temp_1141;
    precise float temp_1142;
    precise float temp_1143;
    precise float temp_1144;
    bool temp_1145;
    bool temp_1146;
    precise float temp_1147;
    precise float temp_1148;
    precise float temp_1149;
    precise float temp_1150;
    precise float temp_1151;
    precise float temp_1152;
    uint temp_1153;
    precise float temp_1154;
    precise float temp_1155;
    precise float temp_1156;
    precise float temp_1157;
    precise float temp_1158;
    precise float temp_1159;
    precise float temp_1160;
    precise float temp_1161;
    precise float temp_1162;
    precise float temp_1163;
    uint temp_1164;
    int temp_1165;
    int temp_1166;
    int temp_1167;
    int temp_1168;
    uint temp_1169;
    int temp_1170;
    int temp_1171;
    int temp_1172;
    int temp_1173;
    precise float temp_1174;
    precise float temp_1175;
    precise float temp_1176;
    uint temp_1177;
    uint temp_1178;
    int temp_1179;
    int temp_1180;
    int temp_1181;
    int temp_1182;
    int temp_1183;
    precise float temp_1184;
    precise float temp_1185;
    precise float temp_1186;
    precise float temp_1187;
    precise float temp_1188;
    int temp_1189;
    int temp_1190;
    int temp_1191;
    int temp_1192;
    uint temp_1193;
    int temp_1194;
    int temp_1195;
    int temp_1196;
    int temp_1197;
    precise float temp_1198;
    int temp_1199;
    int temp_1200;
    precise float temp_1201;
    precise float temp_1202;
    precise float temp_1203;
    uint temp_1204;
    uint temp_1205;
    int temp_1206;
    int temp_1207;
    int temp_1208;
    int temp_1209;
    int temp_1210;
    precise float temp_1211;
    precise float temp_1212;
    precise float temp_1213;
    int temp_1214;
    int temp_1215;
    precise float temp_1216;
    precise float temp_1217;
    precise float temp_1218;
    precise float temp_1219;
    precise float temp_1220;
    precise float temp_1221;
    uint temp_1222;
    precise float temp_1223;
    precise float temp_1224;
    precise float temp_1225;
    precise float temp_1226;
    precise float temp_1227;
    precise float temp_1228;
    precise float temp_1229;
    precise float temp_1230;
    precise float temp_1231;
    precise float temp_1232;
    precise float temp_1233;
    uint temp_1234;
    precise float temp_1235;
    precise float temp_1236;
    precise float temp_1237;
    precise float temp_1238;
    precise float temp_1239;
    precise float temp_1240;
    precise float temp_1241;
    precise float temp_1242;
    precise float temp_1243;
    precise float temp_1244;
    int temp_1245;
    precise float temp_1246;
    precise float temp_1247;
    precise float temp_1248;
    precise float temp_1249;
    int temp_1250;
    precise float temp_1251;
    precise float temp_1252;
    precise float temp_1253;
    precise float temp_1254;
    precise float temp_1255;
    precise float temp_1256;
    precise float temp_1257;
    precise float temp_1258;
    precise float temp_1259;
    precise float temp_1260;
    int temp_1261;
    uint temp_1262;
    uint temp_1263;
    int temp_1264;
    precise float temp_1265;
    int temp_1266;
    uint temp_1267;
    int temp_1268;
    precise float temp_1269;
    precise float temp_1270;
    int temp_1271;
    int temp_1272;
    int temp_1273;
    int temp_1274;
    uint temp_1275;
    int temp_1276;
    int temp_1277;
    int temp_1278;
    int temp_1279;
    precise float temp_1280;
    int temp_1281;
    uint temp_1282;
    uint temp_1283;
    int temp_1284;
    precise float temp_1285;
    int temp_1286;
    uint temp_1287;
    int temp_1288;
    precise float temp_1289;
    precise float temp_1290;
    precise float temp_1291;
    precise float temp_1292;
    precise float temp_1293;
    uint temp_1294;
    uint temp_1295;
    int temp_1296;
    int temp_1297;
    int temp_1298;
    int temp_1299;
    int temp_1300;
    precise float temp_1301;
    precise float temp_1302;
    precise float temp_1303;
    precise float temp_1304;
    precise float temp_1305;
    precise float temp_1306;
    precise float temp_1307;
    int temp_1308;
    int temp_1309;
    int temp_1310;
    uint temp_1311;
    uint temp_1312;
    int temp_1313;
    precise float temp_1314;
    int temp_1315;
    uint temp_1316;
    int temp_1317;
    precise float temp_1318;
    precise float temp_1319;
    precise float temp_1320;
    precise float temp_1321;
    int temp_1322;
    uint temp_1323;
    uint temp_1324;
    int temp_1325;
    precise float temp_1326;
    int temp_1327;
    uint temp_1328;
    int temp_1329;
    precise float temp_1330;
    precise float temp_1331;
    precise float temp_1332;
    precise float temp_1333;
    precise float temp_1334;
    bool temp_1335;
    int temp_1336;
    int temp_1337;
    int temp_1338;
    int temp_1339;
    uint temp_1340;
    int temp_1341;
    int temp_1342;
    int temp_1343;
    int temp_1344;
    precise float temp_1345;
    precise float temp_1346;
    precise float temp_1347;
    int temp_1348;
    int temp_1349;
    int temp_1350;
    uint temp_1351;
    uint temp_1352;
    int temp_1353;
    precise float temp_1354;
    int temp_1355;
    uint temp_1356;
    int temp_1357;
    precise float temp_1358;
    int temp_1359;
    uint temp_1360;
    uint temp_1361;
    int temp_1362;
    precise float temp_1363;
    int temp_1364;
    uint temp_1365;
    int temp_1366;
    precise float temp_1367;
    precise float temp_1368;
    precise float temp_1369;
    uint temp_1370;
    uint temp_1371;
    int temp_1372;
    int temp_1373;
    int temp_1374;
    int temp_1375;
    int temp_1376;
    precise float temp_1377;
    int temp_1378;
    uint temp_1379;
    uint temp_1380;
    int temp_1381;
    precise float temp_1382;
    int temp_1383;
    uint temp_1384;
    int temp_1385;
    precise float temp_1386;
    precise float temp_1387;
    precise float temp_1388;
    precise float temp_1389;
    precise float temp_1390;
    int temp_1391;
    int temp_1392;
    int temp_1393;
    uint temp_1394;
    uint temp_1395;
    int temp_1396;
    precise float temp_1397;
    int temp_1398;
    uint temp_1399;
    int temp_1400;
    precise float temp_1401;
    precise float temp_1402;
    precise float temp_1403;
    precise float temp_1404;
    bool temp_1405;
    int temp_1406;
    precise float temp_1407;
    precise float temp_1408;
    precise float temp_1409;
    int temp_1410;
    int temp_1411;
    uint temp_1412;
    precise float temp_1413;
    precise float temp_1414;
    precise float temp_1415;
    precise float temp_1416;
    precise float temp_1417;
    int temp_1418;
    int temp_1419;
    precise float temp_1420;
    precise float temp_1421;
    precise float temp_1422;
    precise float temp_1423;
    precise float temp_1424;
    precise float temp_1425;
    precise float temp_1426;
    precise float temp_1427;
    precise float temp_1428;
    int temp_1429;
    int temp_1430;
    int temp_1431;
    int temp_1432;
    uint temp_1433;
    int temp_1434;
    int temp_1435;
    int temp_1436;
    int temp_1437;
    precise float temp_1438;
    precise float temp_1439;
    precise float temp_1440;
    precise float temp_1441;
    precise float temp_1442;
    uint temp_1443;
    uint temp_1444;
    int temp_1445;
    int temp_1446;
    int temp_1447;
    int temp_1448;
    int temp_1449;
    precise float temp_1450;
    precise float temp_1451;
    int temp_1452;
    int temp_1453;
    precise float temp_1454;
    precise float temp_1455;
    int temp_1456;
    precise float temp_1457;
    precise float temp_1458;
    precise float temp_1459;
    precise float temp_1460;
    precise float temp_1461;
    precise float temp_1462;
    precise float temp_1463;
    precise float temp_1464;
    precise float temp_1465;
    precise float temp_1466;
    precise float temp_1467;
    precise float temp_1468;
    int temp_1469;
    precise float temp_1470;
    precise float temp_1471;
    precise float temp_1472;
    precise float temp_1473;
    precise float temp_1474;
    precise float temp_1475;
    precise float temp_1476;
    precise float temp_1477;
    precise float temp_1478;
    precise float temp_1479;
    precise float temp_1480;
    precise float temp_1481;
    precise float temp_1482;
    int temp_1483;
    precise float temp_1484;
    precise float temp_1485;
    precise float temp_1486;
    precise float temp_1487;
    precise float temp_1488;
    precise float temp_1489;
    precise float temp_1490;
    precise float temp_1491;
    precise float temp_1492;
    precise float temp_1493;
    precise float temp_1494;
    uint temp_1495;
    uint temp_1496;
    precise float temp_1497;
    precise float temp_1498;
    precise float temp_1499;
    precise float temp_1500;
    precise float temp_1501;
    precise float temp_1502;
    precise float temp_1503;
    precise float temp_1504;
    precise float temp_1505;
    precise float temp_1506;
    precise float temp_1507;
    precise float temp_1508;
    precise float temp_1509;
    precise float temp_1510;
    precise float temp_1511;
    precise float temp_1512;
    precise float temp_1513;
    precise float temp_1514;
    precise float temp_1515;
    precise float temp_1516;
    precise float temp_1517;
    precise float temp_1518;
    precise float temp_1519;
    precise float temp_1520;
    precise float temp_1521;
    precise float temp_1522;
    precise float temp_1523;
    precise float temp_1524;
    precise float temp_1525;
    precise vec3 temp_1526;
    precise float temp_1527;
    precise float temp_1528;
    precise float temp_1529;
    precise float temp_1530;
    precise vec3 temp_1531;
    precise float temp_1532;
    precise float temp_1533;
    precise float temp_1534;
    precise vec3 temp_1535;
    precise float temp_1536;
    precise float temp_1537;
    precise float temp_1538;
    precise float temp_1539;
    precise float temp_1540;
    precise float temp_1541;
    precise float temp_1542;
    precise float temp_1543;
    precise float temp_1544;
    precise float temp_1545;
    precise float temp_1546;
    precise float temp_1547;
    precise float temp_1548;
    precise float temp_1549;
    precise float temp_1550;
    precise float temp_1551;
    precise float temp_1552;
    precise float temp_1553;
    precise float temp_1554;
    precise float temp_1555;
    bool temp_1556;
    precise float temp_1557;
    precise float temp_1558;
    precise float temp_1559;
    precise float temp_1560;
    precise float temp_1561;
    precise float temp_1562;
    precise float temp_1563;
    precise float temp_1564;
    precise float temp_1565;
    precise float temp_1566;
    precise float temp_1567;
    precise float temp_1568;
    precise float temp_1569;
    precise float temp_1570;
    precise float temp_1571;
    precise float temp_1572;
    precise float temp_1573;
    precise float temp_1574;
    precise float temp_1575;
    precise float temp_1576;
    precise float temp_1577;
    precise float temp_1578;
    precise float temp_1579;
    precise float temp_1580;
    precise float temp_1581;
    precise float temp_1582;
    precise float temp_1583;
    precise float temp_1584;
    precise float temp_1585;
    precise float temp_1586;
    precise float temp_1587;
    precise float temp_1588;
    precise float temp_1589;
    precise float temp_1590;
    precise float temp_1591;
    precise float temp_1592;
    precise float temp_1593;
    precise float temp_1594;
    precise float temp_1595;
    precise float temp_1596;
    precise float temp_1597;
    precise float temp_1598;
    precise float temp_1599;
    precise float temp_1600;
    precise float temp_1601;
    precise float temp_1602;
    precise float temp_1603;
    precise float temp_1604;
    precise float temp_1605;
    precise float temp_1606;
    precise float temp_1607;
    precise float temp_1608;
    precise float temp_1609;
    precise float temp_1610;
    precise float temp_1611;
    precise float temp_1612;
    precise float temp_1613;
    precise float temp_1614;
    precise float temp_1615;
    precise float temp_1616;
    precise float temp_1617;
    precise float temp_1618;
    precise float temp_1619;
    precise float temp_1620;
    precise float temp_1621;
    precise float temp_1622;
    precise float temp_1623;
    precise float temp_1624;
    precise float temp_1625;
    precise float temp_1626;
    precise float temp_1627;
    precise float temp_1628;
    precise float temp_1629;
    precise float temp_1630;
    precise float temp_1631;
    precise float temp_1632;
    precise float temp_1633;
    precise float temp_1634;
    precise float temp_1635;
    precise float temp_1636;
    precise float temp_1637;
    precise float temp_1638;
    precise float temp_1639;
    precise float temp_1640;
    precise float temp_1641;
    precise float temp_1642;
    precise float temp_1643;
    precise float temp_1644;
    precise float temp_1645;
    precise float temp_1646;
    precise float temp_1647;
    precise float temp_1648;
    precise float temp_1649;
    precise float temp_1650;
    precise float temp_1651;
    precise float temp_1652;
    precise float temp_1653;
    precise float temp_1654;
    precise float temp_1655;
    precise float temp_1656;
    precise float temp_1657;
    precise float temp_1658;
    precise float temp_1659;
    precise float temp_1660;
    precise float temp_1661;
    precise float temp_1662;
    precise float temp_1663;
    precise float temp_1664;
    precise float temp_1665;
    precise float temp_1666;
    precise float temp_1667;
    precise float temp_1668;
    precise float temp_1669;
    precise float temp_1670;
    precise float temp_1671;
    precise float temp_1672;
    precise float temp_1673;
    precise float temp_1674;
    precise float temp_1675;
    precise float temp_1676;
    precise float temp_1677;
    precise float temp_1678;
    precise float temp_1679;
    precise float temp_1680;
    precise float temp_1681;
    precise float temp_1682;
    precise float temp_1683;
    precise float temp_1684;
    precise float temp_1685;
    precise float temp_1686;
    precise float temp_1687;
    precise float temp_1688;
    precise float temp_1689;
    precise float temp_1690;
    precise float temp_1691;
    precise float temp_1692;
    precise float temp_1693;
    precise float temp_1694;
    precise float temp_1695;
    precise float temp_1696;
    precise float temp_1697;
    precise float temp_1698;
    precise float temp_1699;
    precise float temp_1700;
    precise float temp_1701;
    precise float temp_1702;
    precise float temp_1703;
    precise float temp_1704;
    precise float temp_1705;
    precise float temp_1706;
    precise float temp_1707;
    precise float temp_1708;
    precise float temp_1709;
    precise float temp_1710;
    precise float temp_1711;
    precise float temp_1712;
    precise float temp_1713;
    precise float temp_1714;
    precise float temp_1715;
    precise float temp_1716;
    precise float temp_1717;
    precise float temp_1718;
    precise float temp_1719;
    precise float temp_1720;
    precise float temp_1721;
    precise float temp_1722;
    precise float temp_1723;
    precise float temp_1724;
    precise float temp_1725;
    precise float temp_1726;
    precise float temp_1727;
    precise float temp_1728;
    precise float temp_1729;
    precise float temp_1730;
    precise float temp_1731;
    precise float temp_1732;
    precise float temp_1733;
    precise float temp_1734;
    precise float temp_1735;
    precise float temp_1736;
    precise float temp_1737;
    precise float temp_1738;
    precise float temp_1739;
    precise float temp_1740;
    precise float temp_1741;
    precise float temp_1742;
    precise float temp_1743;
    precise float temp_1744;
    precise float temp_1745;
    precise float temp_1746;
    precise float temp_1747;
    precise float temp_1748;
    precise float temp_1749;
    precise float temp_1750;
    precise float temp_1751;
    precise float temp_1752;
    precise float temp_1753;
    precise float temp_1754;
    precise float temp_1755;
    precise float temp_1756;
    precise float temp_1757;
    precise float temp_1758;
    precise float temp_1759;
    precise float temp_1760;
    precise float temp_1761;
    precise float temp_1762;
    precise float temp_1763;
    precise float temp_1764;
    precise float temp_1765;
    precise float temp_1766;
    precise float temp_1767;
    precise float temp_1768;
    precise float temp_1769;
    precise float temp_1770;
    precise float temp_1771;
    precise float temp_1772;
    precise float temp_1773;
    precise float temp_1774;
    precise float temp_1775;
    precise float temp_1776;
    precise float temp_1777;
    precise float temp_1778;
    precise float temp_1779;
    precise float temp_1780;
    precise float temp_1781;
    precise float temp_1782;
    precise float temp_1783;
    precise float temp_1784;
    precise float temp_1785;
    precise float temp_1786;
    precise float temp_1787;
    precise float temp_1788;
    precise float temp_1789;
    precise float temp_1790;
    precise float temp_1791;
    precise float temp_1792;
    precise float temp_1793;
    precise float temp_1794;
    precise float temp_1795;
    precise float temp_1796;
    precise float temp_1797;
    precise float temp_1798;
    precise float temp_1799;
    precise float temp_1800;
    precise float temp_1801;
    precise float temp_1802;
    precise float temp_1803;
    precise float temp_1804;
    precise float temp_1805;
    precise float temp_1806;
    precise float temp_1807;
    precise float temp_1808;
    precise float temp_1809;
    precise float temp_1810;
    precise float temp_1811;
    precise float temp_1812;
    precise float temp_1813;
    precise float temp_1814;
    precise float temp_1815;
    precise float temp_1816;
    precise float temp_1817;
    precise float temp_1818;
    precise float temp_1819;
    precise float temp_1820;
    precise float temp_1821;
    precise float temp_1822;
    precise float temp_1823;
    precise float temp_1824;
    precise float temp_1825;
    precise float temp_1826;
    precise float temp_1827;
    precise float temp_1828;
    precise float temp_1829;
    precise float temp_1830;
    precise float temp_1831;
    precise float temp_1832;
    precise float temp_1833;
    precise float temp_1834;
    precise float temp_1835;
    precise float temp_1836;
    precise float temp_1837;
    precise float temp_1838;
    precise float temp_1839;
    precise float temp_1840;
    precise float temp_1841;
    precise float temp_1842;
    precise float temp_1843;
    precise float temp_1844;
    precise float temp_1845;
    precise float temp_1846;
    precise float temp_1847;
    precise float temp_1848;
    precise float temp_1849;
    precise float temp_1850;
    precise float temp_1851;
    precise float temp_1852;
    precise float temp_1853;
    precise float temp_1854;
    precise float temp_1855;
    precise float temp_1856;
    precise float temp_1857;
    precise float temp_1858;
    precise float temp_1859;
    precise float temp_1860;
    precise float temp_1861;
    precise float temp_1862;
    precise float temp_1863;
    precise float temp_1864;
    precise float temp_1865;
    precise float temp_1866;
    precise float temp_1867;
    precise float temp_1868;
    precise float temp_1869;
    precise float temp_1870;
    precise float temp_1871;
    precise float temp_1872;
    precise float temp_1873;
    precise float temp_1874;
    precise float temp_1875;
    precise float temp_1876;
    precise float temp_1877;
    precise float temp_1878;
    precise float temp_1879;
    precise float temp_1880;
    precise float temp_1881;
    precise float temp_1882;
    precise float temp_1883;
    precise float temp_1884;
    precise float temp_1885;
    precise float temp_1886;
    precise float temp_1887;
    precise float temp_1888;
    precise float temp_1889;
    precise float temp_1890;
    precise float temp_1891;
    precise float temp_1892;
    precise float temp_1893;
    precise float temp_1894;
    precise float temp_1895;
    precise float temp_1896;
    precise float temp_1897;
    precise float temp_1898;
    precise float temp_1899;
    precise float temp_1900;
    precise float temp_1901;
    precise float temp_1902;
    precise float temp_1903;
    precise float temp_1904;
    precise float temp_1905;
    precise float temp_1906;
    precise float temp_1907;
    precise float temp_1908;
    precise float temp_1909;
    temp_736 = false;
    // 0x000008: 0x5C9807800FF70002 Mov
    // 0x000010: 0x5C9807800FF70000 Mov
    // 0x000018: 0xDF4802E180470202 Txq
    temp_23 = textureSize(cCaveQuadMeshNormals, 0).r;
    temp_24 = TextureSizeUnscale(temp_23, 0);
    temp_25 = textureSize(cCaveQuadMeshNormals, 0).g;
    temp_26 = TextureSizeUnscale(temp_25, 0);
    // 0x000028: 0xDF48030180470000 Txq
    temp_27 = textureSize(cCaveQuadMeshMaterialWeights_Ao, 0).r;
    temp_28 = TextureSizeUnscale(temp_27, 1);
    temp_29 = textureSize(cCaveQuadMeshMaterialWeights_Ao, 0).g;
    temp_30 = TextureSizeUnscale(temp_29, 1);
    // 0x000030: 0xE003FF87CFF7FF22 Ipa
    // 0x000038: 0x010000000017F044 Mov32i
    // 0x000048: 0x0103F0000007F024 Mov32i
    // 0x000050: 0x010000000107F045 Mov32i
    // 0x000058: 0x010000000117F03D Mov32i
    // 0x000068: 0x4C9807B400B70039 Mov
    // 0x000070: 0x4C68102401173938 Fmul
    temp_31 = gsys_scene_material.data[2].w * gsys_environment.data[4].y;
    // 0x000078: 0x4C68102401073946 Fmul
    temp_32 = gsys_scene_material.data[2].w * gsys_environment.data[4].x;
    // 0x000088: 0x4C68102401273939 Fmul
    temp_33 = gsys_scene_material.data[2].w * gsys_environment.data[4].z;
    // 0x000090: 0x51A11C040007381B Ffma
    temp_34 = 0.0 - temp_31;
    temp_35 = fma(temp_31, temp_34, fp_c1.data[0].x);
    // 0x000098: 0x5080000000571B1B Mufu
    temp_36 = inversesqrt(temp_35);
    // 0x0000A8: 0x5080000000472222 Mufu
    // 0x0000B0: 0xE043FF880227FF42 Ipa
    temp_37 = in_pos_camera_space.x;
    // 0x0000B8: 0xE043FF884227FF41 Ipa
    temp_38 = in_pos_camera_space.y;
    // 0x0000C8: 0xE043FF888227FF40 Ipa
    temp_39 = in_pos_camera_space.z;
    // 0x0000D0: 0xE043FF8C0227FF0B Ipa
    temp_40 = in_cave_tex_coords.x;
    // 0x0000D8: 0xE043FF8C4227FF2D Ipa
    temp_41 = in_cave_tex_coords.y;
    // 0x0000E8: 0xE043FF89C227FF09 Ipa
    temp_42 = in_volume_mask_tex_coords.w;
    // 0x0000F0: 0xE043FF890227FF06 Ipa
    temp_43 = in_volume_mask_tex_coords.x;
    // 0x0000F8: 0xE043FF894227FF07 Ipa
    temp_44 = in_volume_mask_tex_coords.y;
    // 0x000108: 0xE043FF8A0227FF16 Ipa
    temp_45 = in_pos_local.x;
    // 0x000110: 0xE043FF8A8227FF2B Ipa
    temp_46 = in_pos_local.z;
    // 0x000118: 0x5C68100004274204 Fmul
    temp_47 = temp_37 * temp_37;
    // 0x000128: 0x5080000000470909 Mufu
    temp_48 = 1.0 / temp_42;
    // 0x000130: 0x1E2BB449BA674047 Fmul32i
    temp_49 = temp_39 * -0.00300000003;
    // 0x000138: 0x1E23C5A740E71614 Fmul32i
    temp_50 = temp_45 * 0.0133333337;
    // 0x000148: 0x1E23C5A740E72B15 Fmul32i
    temp_51 = temp_46 * 0.0133333337;
    // 0x000150: 0x59A002000417411A Ffma
    temp_52 = fma(temp_38, temp_38, temp_47);
    // 0x000158: 0x4C68101002C74204 Fmul
    temp_53 = temp_37 * gsys_context.data[11].x;
    // 0x000168: 0x59A00D000407401A Ffma
    temp_54 = fma(temp_39, temp_39, temp_52);
    // 0x000170: 0x49A0021002D74105 Ffma
    temp_55 = fma(temp_38, gsys_context.data[11].y, temp_53);
    // 0x000178: 0x5080000000571A2F Mufu
    temp_56 = inversesqrt(temp_54);
    // 0x000188: 0x4C68101003474204 Fmul
    temp_57 = temp_37 * gsys_context.data[13].x;
    // 0x000190: 0x5C68100000970606 Fmul
    temp_58 = temp_43 * temp_48;
    // 0x000198: 0x5C68100000970707 Fmul
    temp_59 = temp_44 * temp_48;
    // 0x0001A8: 0x49A0029002E74005 Ffma
    temp_60 = fma(temp_39, gsys_context.data[11].z, temp_55);
    // 0x0001B0: 0x4C58101002F7053E Fadd
    temp_61 = temp_60 + gsys_context.data[11].w;
    // 0x0001B8: 0x5C68100002F7423B Fmul
    temp_62 = temp_37 * temp_56;
    // 0x0001C8: 0x5C68100002F74137 Fmul
    temp_63 = temp_38 * temp_56;
    // 0x0001D0: 0x5C68100002F7402F Fmul
    temp_64 = temp_39 * temp_56;
    // 0x0001D8: 0x49A0120400273E09 Ffma
    temp_65 = fma(temp_61, fp_c1.data[0].z, 0.5);
    // 0x0001E8: 0x4C58102401073B27 Fadd
    temp_66 = temp_62 + gsys_environment.data[4].x;
    // 0x0001F0: 0x4C58102401173705 Fadd
    temp_67 = temp_63 + gsys_environment.data[4].y;
    // 0x0001F8: 0x4C58102401272F23 Fadd
    temp_68 = temp_64 + gsys_environment.data[4].z;
    // 0x000208: 0x4C58302414873E43 Fadd
    temp_69 = 0.0 - gsys_environment.data[82].x;
    temp_70 = temp_61 + temp_69;
    // 0x000210: 0x51A11B840007373C Ffma
    temp_71 = 0.0 - temp_63;
    temp_72 = fma(temp_63, temp_71, fp_c1.data[0].x);
    // 0x000218: 0x5C68100004673B46 Fmul
    temp_73 = temp_62 * temp_32;
    // 0x000228: 0x5080000000573C3C Mufu
    temp_74 = inversesqrt(temp_72);
    // 0x000230: 0x5C68100002772708 Fmul
    temp_75 = temp_66 * temp_66;
    // 0x000238: 0x4C68102414A74343 Fmul
    temp_76 = temp_70 * gsys_environment.data[82].z;
    // 0x000248: 0x59A004000057050A Ffma
    temp_77 = fma(temp_67, temp_67, temp_75);
    // 0x000250: 0x49A0021003574105 Ffma
    temp_78 = fma(temp_38, gsys_context.data[13].y, temp_57);
    // 0x000258: 0x36B183BF80074307 Fsetp
    temp_79 = temp_76 < 1.0;
    // 0x000268: 0x59A005000237230A Ffma
    temp_80 = fma(temp_68, temp_68, temp_77);
    // 0x000270: 0x49A0029003674005 Ffma
    temp_81 = fma(temp_39, gsys_context.data[13].z, temp_78);
    // 0x000278: 0x5080000000570A36 Mufu
    temp_82 = inversesqrt(temp_80);
    // 0x000288: 0x4C5810100377053F Fadd
    temp_83 = temp_81 + gsys_context.data[13].w;
    // 0x000290: 0x5BB480000FF74307 Fsetp
    temp_84 = temp_76 > 0.0;
    temp_85 = temp_84 && temp_79;
    // 0x000298: 0x49A0120400173F08 Ffma
    temp_86 = fma(temp_83, fp_c1.data[0].y, 0.5);
    // 0x0002A8: 0x4C58302414973F3A Fadd
    temp_87 = 0.0 - gsys_environment.data[82].y;
    temp_88 = temp_83 + temp_87;
    // 0x0002B0: 0x4C68102414A73A3A Fmul
    temp_89 = temp_88 * gsys_environment.data[82].z;
    // 0x0002B8: 0x5BB480000FF73A07 Fsetp
    temp_90 = temp_89 > 0.0;
    temp_91 = temp_90 && temp_85;
    // 0x0002C8: 0x36B1803F80073A0F Fsetp
    temp_92 = temp_89 < 1.0;
    temp_93 = temp_92 && temp_91;
    // 0x0002D0: 0x5CB8000000272A02 I2f
    temp_94 = float(temp_24);
    // 0x0002D8: 0x5CB8000000372A03 I2f
    temp_95 = float(temp_26);
    // 0x0002E8: 0x5CB8000000172A04 I2f
    temp_96 = float(temp_30);
    // 0x0002F0: 0x5CB8000000072A00 I2f
    temp_97 = float(temp_28);
    // 0x0002F8: 0x51A0058400370229 Ffma
    temp_98 = fma(temp_94, temp_40, fp_c1.data[0].w);
    // 0x000308: 0x51A016840037032C Ffma
    temp_99 = fma(temp_95, temp_41, fp_c1.data[0].w);
    // 0x000310: 0x5CB0118002971A34 F2i
    temp_100 = trunc(temp_98);
    temp_101 = int(temp_100);
    // 0x000318: 0x51A0020400372D2D Ffma
    temp_102 = fma(temp_41, temp_96, fp_c1.data[0].w);
    // 0x000328: 0x5CB0118002C71A35 F2i
    temp_103 = trunc(temp_99);
    temp_104 = int(temp_103);
    // 0x000330: 0x4C9807B407370002 Mov
    // 0x000338: 0x5CB0118002D71A21 F2i
    temp_105 = trunc(temp_102);
    temp_106 = int(temp_105);
    // 0x000348: 0x51A0000400370B2A Ffma
    temp_107 = fma(temp_40, temp_97, fp_c1.data[0].w);
    // 0x000350: 0x5CB0118002A71A20 F2i
    temp_108 = trunc(temp_107);
    temp_109 = int(temp_108);
    // 0x000358: 0x49A104A405C70200 Ffma
    temp_110 = 0.0 - gsys_environment.data[23].x;
    temp_111 = fma(gsys_scene_material.data[28].w, temp_110, temp_65);
    // 0x000368: 0x49A1042405E70201 Ffma
    temp_112 = 0.0 - gsys_environment.data[23].z;
    temp_113 = fma(gsys_scene_material.data[28].w, temp_112, temp_86);
    // 0x000370: 0xDA8002E2E4473404 Tlds
    temp_114 = TexelFetchScale(temp_101, 0, 0);
    temp_115 = TexelFetchScale(temp_104, 0, 1);
    temp_116 = texelFetchOffset(cCaveQuadMeshNormals, ivec2(temp_114, temp_115), 0, ivec2(1, 0)).xyz;
    temp_117 = temp_116.x;
    temp_118 = temp_116.y;
    temp_119 = temp_116.z;
    // 0x000378: 0xDA4002E30357341C Tlds
    temp_120 = TexelFetchScale(temp_101, 0, 0);
    temp_121 = TexelFetchScale(temp_104, 0, 1);
    temp_122 = texelFetch(cCaveQuadMeshNormals, ivec2(temp_120, temp_121), 0).xyz;
    temp_123 = temp_122.x;
    temp_124 = temp_122.y;
    temp_125 = temp_122.z;
    // 0x000388: 0xDA8002E314573402 Tlds
    temp_126 = TexelFetchScale(temp_101, 0, 0);
    temp_127 = TexelFetchScale(temp_104, 0, 1);
    temp_128 = texelFetchOffset(cCaveQuadMeshNormals, ivec2(temp_126, temp_127), 0, ivec2(0, 1)).xyz;
    temp_129 = temp_128.x;
    temp_130 = temp_128.y;
    temp_131 = temp_128.z;
    // 0x000390: 0xDA8002E333D7341E Tlds
    temp_132 = TexelFetchScale(temp_101, 0, 0);
    temp_133 = TexelFetchScale(temp_104, 0, 1);
    temp_134 = texelFetchOffset(cCaveQuadMeshNormals, ivec2(temp_132, temp_133), 0, ivec2(1, 1)).xyz;
    temp_135 = temp_134.x;
    temp_136 = temp_134.y;
    temp_137 = temp_134.z;
    // 0x000398: 0xDA8003025447200E Tlds
    temp_138 = TexelFetchScale(temp_109, 1, 0);
    temp_139 = TexelFetchScale(temp_106, 1, 1);
    temp_140 = texelFetchOffset(cCaveQuadMeshMaterialWeights_Ao, ivec2(temp_138, temp_139), 0, ivec2(1, 0)).xyz;
    temp_141 = temp_140.x;
    temp_142 = temp_140.y;
    temp_143 = temp_140.z;
    // 0x0003A8: 0xDA40030262172010 Tlds
    temp_144 = TexelFetchScale(temp_109, 1, 0);
    temp_145 = TexelFetchScale(temp_106, 1, 1);
    temp_146 = texelFetch(cCaveQuadMeshMaterialWeights_Ao, ivec2(temp_144, temp_145), 0).xyz;
    temp_147 = temp_146.x;
    temp_148 = temp_146.y;
    temp_149 = temp_146.z;
    // 0x0003B0: 0xDA80030284572012 Tlds
    temp_150 = TexelFetchScale(temp_109, 1, 0);
    temp_151 = TexelFetchScale(temp_106, 1, 1);
    temp_152 = texelFetchOffset(cCaveQuadMeshMaterialWeights_Ao, ivec2(temp_150, temp_151), 0, ivec2(0, 1)).xyz;
    temp_153 = temp_152.x;
    temp_154 = temp_152.y;
    temp_155 = temp_152.z;
    // 0x0003B8: 0xD830032181571414 Texs
    temp_156 = texture(cCaveMaterialWeightsDetail, vec2(temp_50, temp_51)).xyzw;
    temp_157 = temp_156.x;
    temp_158 = temp_156.y;
    temp_159 = temp_156.z;
    temp_160 = temp_156.w;
    // 0x0003C8: 0xDA80030323D7200C Tlds
    temp_161 = TexelFetchScale(temp_109, 1, 0);
    temp_162 = TexelFetchScale(temp_106, 1, 1);
    temp_163 = texelFetchOffset(cCaveQuadMeshMaterialWeights_Ao, ivec2(temp_161, temp_162), 0, ivec2(1, 1)).xyz;
    temp_164 = temp_163.x;
    temp_165 = temp_163.y;
    temp_166 = temp_163.z;
    // 0x0003D0: 0xD862020FF4770000 Texs
    temp_167 = textureLod(cTex_SkyIslandShadow, vec2(temp_111, temp_113), temp_49).x;
    // 0x0003D8: 0xD82201A170770606 Texs
    temp_168 = texture(cTex_VolumeMask, vec2(temp_58, temp_59)).xyz;
    temp_169 = temp_168.x;
    temp_170 = temp_168.y;
    temp_171 = temp_168.z;
    // 0x0003E8: 0xD8520160A0870908 Texs
    temp_172 = textureLod(cTex_WorldShadowHeight, vec2(temp_65, temp_86), 0.0).xyzw;
    temp_173 = temp_172.x;
    temp_174 = temp_172.y;
    temp_175 = temp_172.z;
    temp_176 = temp_172.w;
    // 0x0003F0: 0xD82E02CFF3A14343 Texs
    temp_177 = temp_76;
    temp_178 = temp_82;
    temp_179 = temp_49;
    temp_180 = temp_118;
    temp_181 = temp_137;
    temp_182 = temp_176;
    if (temp_93)
    {
        temp_183 = texture(cTex_MinusFieldLightMap, vec2(temp_76, temp_89)).w;
        temp_177 = temp_183;
    }
    temp_184 = temp_177;
    // 0x0003F8: 0x5C68100003672323 Fmul
    temp_185 = temp_68 * temp_82;
    // 0x000408: 0xE290000082000000 Ssy
    // 0x000410: 0x308183BF80073AFF Fset
    temp_186 = temp_89 < 1.0;
    temp_187 = (temp_186 ? -1 : 0) == 0;
    temp_188 = (temp_186 ? -1 : 0) < 0;
    // 0x000418: 0x59A0230003873738 Ffma
    temp_189 = fma(temp_63, temp_31, temp_73);
    // 0x000428: 0x5CA8148002970A20 F2f
    temp_190 = floor(temp_98);
    // 0x000430: 0x5C68100001B73C3C Fmul
    temp_191 = temp_74 * temp_36;
    // 0x000438: 0x5CA8148002C70A21 F2f
    temp_192 = floor(temp_99);
    // 0x000448: 0x59A0230003972F46 Ffma
    temp_193 = fma(temp_64, temp_33, temp_73);
    // 0x000450: 0x59A01C0003972F1B Ffma
    temp_194 = fma(temp_64, temp_33, temp_189);
    // 0x000458: 0x5C68100004673C3C Fmul
    temp_195 = temp_191 * temp_193;
    // 0x000468: 0x5C58300002072901 Fadd
    temp_196 = 0.0 - temp_190;
    temp_197 = temp_98 + temp_196;
    // 0x000470: 0x5C58300002172C20 Fadd
    temp_198 = 0.0 - temp_192;
    temp_199 = temp_99 + temp_198;
    // 0x000478: 0x5C58100002070121 Fadd
    temp_200 = temp_197 + temp_199;
    // 0x000488: 0x36B183BF8007210F Fsetp
    temp_201 = temp_200 < 1.0;
    // 0x000490: 0x5C59300002010136 Fadd
    temp_202 = temp_199;
    temp_203 = temp_184;
    if (temp_201)
    {
        temp_204 = 0.0 - temp_197;
        temp_205 = 0.0 - temp_199;
        temp_206 = temp_204 + temp_205;
        temp_178 = temp_206;
    }
    temp_207 = temp_178;
    // 0x000498: 0x5C98078000110047 Mov
    temp_208 = temp_207;
    if (temp_201)
    {
        temp_179 = temp_197;
    }
    temp_209 = temp_179;
    // 0x0004A8: 0x3859103F80092047 Fadd
    temp_210 = temp_209;
    if (!temp_201)
    {
        temp_211 = 0.0 - temp_199;
        temp_212 = temp_211 + 1.0;
        temp_210 = temp_212;
    }
    temp_213 = temp_210;
    // 0x0004B0: 0x5C9807800FF90036 Mov
    if (!temp_201)
    {
        temp_208 = 0.0;
    }
    temp_214 = temp_208;
    // 0x0004B8: 0x3859103F80090120 Fadd
    temp_215 = temp_214;
    if (!temp_201)
    {
        temp_216 = 0.0 - temp_197;
        temp_217 = temp_216 + 1.0;
        temp_202 = temp_217;
    }
    temp_218 = temp_202;
    // 0x0004C8: 0xE043FF8D4227FF01 Ipa
    temp_219 = in_2d_coords.y;
    // 0x0004D0: 0x3858103F80013636 Fadd
    if (temp_201)
    {
        temp_220 = temp_214 + 1.0;
        temp_215 = temp_220;
    }
    temp_221 = temp_215;
    // 0x0004D8: 0xF0F0000034B70000 Depbar
    // 0x0004E8: 0x5C68100004770429 Fmul
    temp_222 = temp_117 * temp_213;
    // 0x0004F0: 0xE043FF8D0227FF04 Ipa
    temp_223 = in_2d_coords.x;
    // 0x0004F8: 0x5C6810000477052C Fmul
    temp_224 = temp_118 * temp_213;
    // 0x000508: 0x5C9807800FF10005 Mov
    if (temp_201)
    {
        temp_180 = 0.0;
    }
    temp_225 = temp_180;
    // 0x000510: 0x5C68100004772E47 Fmul
    temp_226 = temp_119 * temp_213;
    // 0x000518: 0x5CA8148002D70A2E F2f
    temp_227 = floor(temp_102);
    // 0x000528: 0x3958103F80092105 Fadd
    temp_228 = temp_225;
    if (!temp_201)
    {
        temp_229 = temp_200 + -1.0;
        temp_228 = temp_229;
    }
    temp_230 = temp_228;
    // 0x000530: 0x5CA8148002A70A21 F2f
    temp_231 = floor(temp_107);
    // 0x000538: 0x59A0148003671C29 Ffma
    temp_232 = fma(temp_123, temp_221, temp_222);
    // 0x000548: 0x59A0160003671D1D Ffma
    temp_233 = fma(temp_124, temp_221, temp_224);
    // 0x000550: 0x59A0238003673047 Ffma
    temp_234 = fma(temp_125, temp_221, temp_226);
    // 0x000558: 0xF0F0000034970000 Depbar
    // 0x000568: 0x59A014800207021C Ffma
    temp_235 = fma(temp_129, temp_218, temp_232);
    // 0x000570: 0xE083FF8B4FF7FF02 Ipa
    material_flags = in_mat_flags.y;
    // 0x000578: 0x59A00E800207032C Ffma
    temp_237 = fma(temp_130, temp_218, temp_233);
    // 0x000588: 0x0103F8888897F029 Mov32i
    // 0x000590: 0x59A0238002073120 Ffma
    temp_238 = fma(temp_131, temp_218, temp_234);
    // 0x000598: 0x5C58300002E72D2E Fadd
    temp_239 = 0.0 - temp_227;
    temp_240 = temp_102 + temp_239;
    // 0x0005A8: 0x5C58300002172A1D Fadd
    temp_241 = 0.0 - temp_231;
    temp_242 = temp_107 + temp_241;
    // 0x0005B0: 0x59A00E0000571E1E Ffma
    temp_243 = fma(temp_135, temp_230, temp_235);
    // 0x0005B8: 0x59A0160000571F03 Ffma
    temp_244 = fma(temp_136, temp_230, temp_237);
    // 0x0005C8: 0x010000000027F031 Mov32i
    // 0x0005D0: 0x59A0100000573320 Ffma
    temp_245 = fma(temp_137, temp_230, temp_238);
    // 0x0005D8: 0x5C58100002E71D21 Fadd
    temp_246 = temp_242 + temp_240;
    // 0x0005E8: 0x49A2148400471E1E Ffma
    temp_247 = fma(temp_243, fp_c1.data[1].x, -1.06666672);
    // 0x0005F0: 0x49A2148400470303 Ffma
    temp_248 = fma(temp_244, fp_c1.data[1].x, -1.06666672);
    // 0x0005F8: 0x49A2148400472005 Ffma
    temp_249 = fma(temp_245, fp_c1.data[1].x, -1.06666672);
    // 0x000608: 0x36B183BF8007210F Fsetp
    temp_250 = temp_246 < 1.0;
    // 0x000610: 0x5C68100001E71E1C Fmul
    temp_251 = temp_247 * temp_247;
    // 0x000618: 0x5C58100000170401 Fadd
    temp_252 = temp_223 + temp_219;
    // 0x000628: 0x59A00E000037031C Ffma
    temp_253 = fma(temp_248, temp_248, temp_251);
    // 0x000630: 0x36B483BF80070117 Fsetp
    temp_254 = temp_252 > 1.0;
    // 0x000638: 0x59A00E000057051F Ffma
    temp_255 = fma(temp_249, temp_249, temp_253);
    // 0x000648: 0x3800000071870201 Bfe
    temp_256 = bitfieldExtract(material_flags, 24, 7);
    // 0x000650: 0x5080000000571F2C Mufu
    temp_257 = inversesqrt(temp_255);
    // 0x000658: 0x5C59300002E11D47 Fadd
    temp_258 = temp_234;
    temp_259 = temp_245;
    temp_260 = uintBitsToFloat(temp_256);
    if (temp_250)
    {
        temp_261 = 0.0 - temp_242;
        temp_262 = 0.0 - temp_240;
        temp_263 = temp_261 + temp_262;
        temp_258 = temp_263;
    }
    temp_264 = temp_258;
    // 0x000668: 0x5C98078001D10020 Mov
    temp_265 = temp_264;
    if (temp_250)
    {
        temp_259 = temp_242;
    }
    temp_266 = temp_259;
    // 0x000670: 0x3859103F80092E20 Fadd
    temp_267 = temp_266;
    if (!temp_250)
    {
        temp_268 = 0.0 - temp_240;
        temp_269 = temp_268 + 1.0;
        temp_267 = temp_269;
    }
    temp_270 = temp_267;
    // 0x000678: 0x380000007117021C Bfe
    temp_271 = bitfieldExtract(material_flags, 17, 7);
    // 0x000688: 0x3958103F80092133 Fadd
    temp_272 = int(temp_271);
    if (!temp_250)
    {
        temp_273 = temp_246 + -1.0;
        temp_181 = temp_273;
    }
    temp_274 = temp_181;
    // 0x000690: 0x5C9807800012001C Mov
    temp_275 = temp_274;
    if (temp_254)
    {
        temp_272 = int(temp_256);
    }
    temp_276 = temp_272;
    // 0x000698: 0x3859103F80091D01 Fadd
    if (!temp_250)
    {
        temp_277 = 0.0 - temp_242;
        temp_278 = temp_277 + 1.0;
        temp_260 = temp_278;
    }
    temp_279 = temp_260;
    // 0x0006A8: 0x3858103F80014747 Fadd
    temp_280 = temp_279;
    if (temp_250)
    {
        temp_281 = temp_264 + 1.0;
        temp_265 = temp_281;
    }
    temp_282 = temp_265;
    // 0x0006B0: 0x5C9807800FF90047 Mov
    temp_283 = temp_282;
    if (!temp_250)
    {
        temp_283 = 0.0;
    }
    temp_284 = temp_283;
    // 0x0006B8: 0xF0F0000034870000 Depbar
    // 0x0006C8: 0x5C68100002070E21 Fmul
    temp_285 = temp_141 * temp_270;
    // 0x0006D0: 0x5C98078002E10001 Mov
    if (temp_250)
    {
        temp_280 = temp_240;
    }
    temp_286 = temp_280;
    // 0x0006D8: 0x010000016127F02E Mov32i
    // 0x0006E8: 0x5C68100002C70304 Fmul
    temp_287 = temp_248 * temp_257;
    // 0x0006F0: 0x5C68100002C70503 Fmul
    temp_288 = temp_249 * temp_257;
    // 0x0006F8: 0x5C68100002C71E05 Fmul
    temp_289 = temp_247 * temp_257;
    // 0x000708: 0x5C68100002072525 Fmul
    temp_290 = temp_143 * temp_270;
    // 0x000710: 0x5C9807800FF10033 Mov
    if (temp_250)
    {
        temp_275 = 0.0;
    }
    temp_291 = temp_275;
    // 0x000718: 0x5C5B50000037041D Fadd
    temp_292 = abs(temp_287);
    temp_293 = 0.0 - temp_292;
    temp_294 = abs(temp_288);
    temp_295 = temp_293 + temp_294;
    // 0x000728: 0x5C5B50000037051E Fadd
    temp_296 = abs(temp_289);
    temp_297 = 0.0 - temp_296;
    temp_298 = abs(temp_288);
    temp_299 = temp_297 + temp_298;
    // 0x000730: 0x5C5A70000037041F Fadd
    temp_300 = abs(temp_287);
    temp_301 = abs(temp_288);
    temp_302 = 0.0 - temp_301;
    temp_303 = temp_300 + temp_302;
    // 0x000738: 0x5C5B500000470529 Fadd
    temp_304 = abs(temp_289);
    temp_305 = 0.0 - temp_304;
    temp_306 = abs(temp_287);
    temp_307 = temp_305 + temp_306;
    // 0x000748: 0x5C5A70000037052A Fadd
    temp_308 = abs(temp_289);
    temp_309 = abs(temp_288);
    temp_310 = 0.0 - temp_309;
    temp_311 = temp_308 + temp_310;
    // 0x000750: 0x5C5A70000047052D Fadd
    temp_312 = abs(temp_289);
    temp_313 = abs(temp_287);
    temp_314 = 0.0 - temp_313;
    temp_315 = temp_312 + temp_314;
    // 0x000758: 0x49A4120400571D1D Ffma
    temp_316 = fma(temp_295, fp_c1.data[1].y, 0.5);
    temp_317 = clamp(temp_316, 0.0, 1.0);
    // 0x000768: 0x49A4120400571E1E Ffma
    temp_318 = fma(temp_299, fp_c1.data[1].y, 0.5);
    temp_319 = clamp(temp_318, 0.0, 1.0);
    // 0x000770: 0x49A4120400571F1F Ffma
    temp_320 = fma(temp_303, fp_c1.data[1].y, 0.5);
    temp_321 = clamp(temp_320, 0.0, 1.0);
    // 0x000778: 0x49A412040057290E Ffma
    temp_322 = fma(temp_307, fp_c1.data[1].y, 0.5);
    temp_323 = clamp(temp_322, 0.0, 1.0);
    // 0x000788: 0x49A4120400572A2A Ffma
    temp_324 = fma(temp_311, fp_c1.data[1].y, 0.5);
    temp_325 = clamp(temp_324, 0.0, 1.0);
    // 0x000790: 0x49A4120400572D2D Ffma
    temp_326 = fma(temp_315, fp_c1.data[1].y, 0.5);
    temp_327 = clamp(temp_326, 0.0, 1.0);
    // 0x000798: 0xF0F0000034670000 Depbar
    // 0x0007A8: 0x59A0108004771024 Ffma
    temp_328 = fma(temp_147, temp_284, temp_285);
    // 0x0007B0: 0x088BEE6666670421 Fadd32i
    temp_329 = temp_287 + -0.449999988;
    // 0x0007B8: 0x5C68100001E71D1E Fmul
    temp_330 = temp_317 * temp_319;
    // 0x0007C8: 0x3800000070A7021D Bfe
    temp_331 = bitfieldExtract(material_flags, 10, 7);
    // 0x0007D0: 0x59A0128004772626 Ffma
    temp_332 = fma(temp_149, temp_284, temp_290);
    // 0x0007D8: 0x3800000070370210 Bfe
    temp_333 = bitfieldExtract(material_flags, 3, 7);
    // 0x0007E8: 0x5C68100002D72A02 Fmul
    temp_334 = temp_325 * temp_327;
    // 0x0007F0: 0x3600170134B71C2D Xmad
    temp_335 = temp_276 & 0xFFFF;
    temp_336 = temp_335 * 0x134B;
    temp_337 = temp_336 + 0x1612;
    // 0x0007F8: 0x1EA411FFFFE7212A Fmul32i
    temp_338 = temp_329 * 9.99999809;
    temp_339 = clamp(temp_338, 0.0, 1.0);
    // 0x000808: 0x59A0120000171221 Ffma
    temp_340 = fma(temp_153, temp_286, temp_328);
    // 0x000810: 0x3600170134B71D29 Xmad
    temp_341 = int(temp_331) & 0xFFFF;
    temp_342 = temp_341 * 0x134B;
    temp_343 = temp_342 + 0x1612;
    // 0x000818: 0x3600170134B7102C Xmad
    temp_344 = int(temp_333) & 0xFFFF;
    temp_345 = temp_344 * 0x134B;
    temp_346 = temp_345 + 0x1612;
    // 0x000828: 0x59A0130000172828 Ffma
    temp_347 = fma(temp_155, temp_286, temp_332);
    // 0x000830: 0x3620169134B71C25 Xmad
    temp_348 = uint(temp_276) >> 16;
    temp_349 = int(temp_348) * 0x134B;
    temp_350 = temp_349 << 16;
    temp_351 = temp_350 + temp_337;
    // 0x000838: 0xF0F0000034570000 Depbar
    // 0x000848: 0x5C68100001472A24 Fmul
    temp_352 = temp_339 * temp_157;
    // 0x000850: 0x5C68100001572A15 Fmul
    temp_353 = temp_339 * temp_158;
    // 0x000858: 0x5C68100001872A18 Fmul
    temp_354 = temp_339 * temp_159;
    // 0x000868: 0x5C68100001972A19 Fmul
    temp_355 = temp_339 * temp_160;
    // 0x000870: 0x0400000FFFF72912 Lop32i
    temp_356 = temp_343 & 0xFFFF;
    // 0x000878: 0x0400000FFFF72C14 Lop32i
    temp_357 = temp_346 & 0xFFFF;
    // 0x000888: 0x0400000FFFF72525 Lop32i
    temp_358 = temp_351 & 0xFFFF;
    // 0x000890: 0x32A2154000072424 Ffma
    temp_359 = 0.0 - temp_339;
    temp_360 = fma(temp_352, 2.0, temp_359);
    // 0x000898: 0x32A2154000071515 Ffma
    temp_361 = 0.0 - temp_339;
    temp_362 = fma(temp_353, 2.0, temp_361);
    // 0x0008A8: 0x32A2154000071818 Ffma
    temp_363 = 0.0 - temp_339;
    temp_364 = fma(temp_354, 2.0, temp_363);
    // 0x0008B0: 0x32A2154000071919 Ffma
    temp_365 = 0.0 - temp_339;
    temp_366 = fma(temp_355, 2.0, temp_365);
    // 0x0008B8: 0x3801000010E7122A Bfe
    temp_367 = bitfieldExtract(temp_356, 14, 1);
    // 0x0008C8: 0xF0F0000034470000 Depbar
    // 0x0008D0: 0x59A0108003370C2D Ffma
    temp_368 = fma(temp_164, temp_291, temp_340);
    // 0x0008D8: 0x3801000010E72526 Bfe
    temp_369 = bitfieldExtract(temp_358, 14, 1);
    // 0x0008E8: 0x5C47040001572415 Lop
    temp_370 = floatBitsToInt(temp_360) ^ floatBitsToInt(temp_362);
    // 0x0008F0: 0x3801000010E7142E Bfe
    temp_371 = bitfieldExtract(temp_357, 14, 1);
    // 0x0008F8: 0x5C47040001971819 Lop
    temp_372 = floatBitsToInt(temp_364) ^ floatBitsToInt(temp_366);
    // 0x000908: 0x59A0140003373232 Ffma
    temp_373 = fma(temp_166, temp_291, temp_347);
    // 0x000910: 0x3801000010F7122C Bfe
    temp_374 = bitfieldExtract(temp_356, 15, 1);
    // 0x000918: 0x5BE70A878267240C Lop3
    temp_375 = temp_369 & temp_370;
    temp_376 = floatBitsToInt(temp_360) ^ temp_375;
    // 0x000928: 0x5BE7150781572421 Lop3
    temp_377 = temp_370 & temp_367;
    temp_378 = floatBitsToInt(temp_360) ^ temp_377;
    // 0x000930: 0x5BE7170781572428 Lop3
    temp_379 = temp_370 & temp_371;
    temp_380 = floatBitsToInt(temp_360) ^ temp_379;
    // 0x000938: 0x5BE70C8782671826 Lop3
    temp_381 = temp_369 & temp_372;
    temp_382 = floatBitsToInt(temp_364) ^ temp_381;
    // 0x000948: 0x5BE715078197182A Lop3
    temp_383 = temp_372 & temp_367;
    temp_384 = floatBitsToInt(temp_364) ^ temp_383;
    // 0x000950: 0x5BE717078197182E Lop3
    temp_385 = temp_372 & temp_371;
    temp_386 = floatBitsToInt(temp_364) ^ temp_385;
    // 0x000958: 0x5C59300003272D18 Fadd
    temp_387 = 0.0 - temp_368;
    temp_388 = 0.0 - temp_373;
    temp_389 = temp_387 + temp_388;
    // 0x000968: 0x3801000010F72525 Bfe
    temp_390 = bitfieldExtract(temp_358, 15, 1);
    // 0x000970: 0x010000000017F015 Mov32i
    // 0x000978: 0x3801000010F71429 Bfe
    temp_391 = bitfieldExtract(temp_357, 15, 1);
    // 0x000988: 0x5C5C30000FF72D14 Fadd
    temp_392 = temp_368 + -0.0;
    temp_393 = clamp(temp_392, 0.0, 1.0);
    // 0x000990: 0x5C5C30000FF73224 Fadd
    temp_394 = temp_373 + -0.0;
    temp_395 = clamp(temp_394, 0.0, 1.0);
    // 0x000998: 0x385C103F80071819 Fadd
    temp_396 = temp_389 + 1.0;
    temp_397 = clamp(temp_396, 0.0, 1.0);
    // 0x0009A8: 0x5BE7150B82C72112 Lop3
    temp_398 = temp_374 & temp_384;
    temp_399 = ~temp_374;
    temp_400 = temp_399 & temp_378;
    temp_401 = temp_398 | temp_400;
    // 0x0009B0: 0x5BE7130B82570C0C Lop3
    temp_402 = temp_390 & temp_382;
    temp_403 = ~temp_390;
    temp_404 = temp_403 & temp_376;
    temp_405 = temp_402 | temp_404;
    // 0x0009B8: 0x5BE7170B82972829 Lop3
    temp_406 = temp_391 & temp_386;
    temp_407 = ~temp_391;
    temp_408 = temp_407 & temp_380;
    temp_409 = temp_406 | temp_408;
    // 0x0009C8: 0x59A10A0001471426 Ffma
    temp_410 = 0.0 - temp_393;
    temp_411 = fma(temp_393, temp_410, temp_393);
    // 0x0009D0: 0x36F00F002007FF2D Bfi
    temp_412 = bitfieldInsert(floatBitsToInt(temp_330), 0, 0, 2);
    // 0x0009D8: 0x59A10C800197192A Ffma
    temp_413 = 0.0 - temp_397;
    temp_414 = fma(temp_397, temp_413, temp_397);
    // 0x0009E8: 0x36F0010020071530 Bfi
    temp_415 = bitfieldInsert(floatBitsToInt(temp_334), 1, 0, 2);
    // 0x0009F0: 0x59A1120002472425 Ffma
    temp_416 = 0.0 - temp_395;
    temp_417 = fma(temp_395, temp_416, temp_395);
    // 0x0009F8: 0x5C68100000E71F28 Fmul
    temp_418 = temp_321 * temp_323;
    // 0x000A08: 0x59A00A0002672926 Ffma
    temp_419 = fma(intBitsToFloat(temp_409), temp_411, temp_393);
    // 0x000A10: 0x59A00C8002A70C2A Ffma
    temp_420 = fma(intBitsToFloat(temp_405), temp_414, temp_397);
    // 0x000A18: 0x5C20038003072D18 Imnmx
    temp_421 = min(uint(temp_412), uint(temp_415));
    // 0x000A28: 0x59A0120002571225 Ffma
    temp_422 = fma(intBitsToFloat(temp_401), temp_417, temp_395);
    // 0x000A30: 0x5C20078003072D21 Imnmx
    temp_423 = max(uint(temp_412), uint(temp_415));
    // 0x000A38: 0x59A1130002672614 Ffma
    temp_424 = 0.0 - temp_419;
    temp_425 = fma(temp_419, temp_424, temp_419);
    // 0x000A48: 0x5C60178000272819 Fmnmx
    temp_426 = max(temp_418, temp_334);
    // 0x000A50: 0x59A1150002A72A2D Ffma
    temp_427 = 0.0 - temp_420;
    temp_428 = fma(temp_420, temp_427, temp_420);
    // 0x000A58: 0x4C68101003074224 Fmul
    temp_429 = temp_37 * gsys_context.data[12].x;
    // 0x000A68: 0x59A112800257251F Ffma
    temp_430 = 0.0 - temp_422;
    temp_431 = fma(temp_422, temp_430, temp_422);
    // 0x000A70: 0x36F014002007312C Bfi
    temp_432 = bitfieldInsert(floatBitsToInt(temp_418), 2, 0, 2);
    // 0x000A78: 0x59A0130001472902 Ffma
    temp_433 = fma(intBitsToFloat(temp_409), temp_425, temp_419);
    // 0x000A88: 0xF0C8000001270014 S2r
    // 0x000A90: 0x59A0150002D70C0E Ffma
    temp_434 = fma(intBitsToFloat(temp_405), temp_428, temp_420);
    // 0x000A98: 0xE043FF8A4227FF0C Ipa
    temp_435 = in_pos_local.y;
    // 0x000AA8: 0x59A0128001F7121F Ffma
    temp_436 = fma(intBitsToFloat(temp_401), temp_431, temp_422);
    // 0x000AB0: 0x5C20038002C72112 Imnmx
    temp_437 = min(temp_423, uint(temp_432));
    // 0x000AB8: 0x36F001002007FF26 Bfi
    temp_438 = bitfieldInsert(floatBitsToInt(temp_433), 0, 0, 2);
    // 0x000AC8: 0x36F0070020073125 Bfi
    temp_439 = bitfieldInsert(floatBitsToInt(temp_434), 2, 0, 2);
    // 0x000AD0: 0x36F00F8020071528 Bfi
    temp_440 = bitfieldInsert(floatBitsToInt(temp_436), 1, 0, 2);
    // 0x000AD8: 0x36F013007027102A Bfi
    temp_441 = bitfieldInsert(temp_438, int(temp_333), 2, 7);
    // 0x000AE8: 0x36F0128070271C29 Bfi
    temp_442 = bitfieldInsert(temp_439, temp_276, 2, 7);
    // 0x000AF0: 0x49A0121003174125 Ffma
    temp_443 = fma(temp_38, gsys_context.data[12].y, temp_429);
    // 0x000AF8: 0x5C20078002C72115 Imnmx
    temp_444 = max(temp_423, uint(temp_432));
    // 0x000B08: 0x36F0140070271D21 Bfi
    temp_445 = bitfieldInsert(temp_440, int(temp_331), 2, 7);
    // 0x000B10: 0x5C20078002A72926 Imnmx
    temp_446 = max(uint(temp_442), uint(temp_441));
    // 0x000B18: 0x49A012900327403D Ffma
    temp_447 = fma(temp_39, gsys_context.data[12].z, temp_443);
    // 0x000B28: 0x5C20038002A72922 Imnmx
    temp_448 = min(uint(temp_442), uint(temp_441));
    // 0x000B30: 0x5C20038001271825 Imnmx
    temp_449 = min(temp_421, temp_437);
    // 0x000B38: 0x5C20038002172624 Imnmx
    temp_450 = min(temp_446, uint(temp_445));
    // 0x000B48: 0x4C58101003373D3D Fadd
    temp_451 = temp_447 + gsys_context.data[12].w;
    // 0x000B50: 0xE24000000C80000D Bra
    temp_452 = !temp_187;
    temp_453 = temp_188 || temp_452;
    temp_454 = temp_91 && temp_453;
    if (!temp_454)
    {
        // 0x000B58: 0x4C9807A40B470028 Mov
        // 0x000B68: 0x4C9807A40B570029 Mov
        // 0x000B70: 0x51A014240B673E28 Ffma
        temp_455 = fma(temp_61, gsys_environment.data[45].x, gsys_environment.data[45].z);
        // 0x000B78: 0x51A014A40B773F29 Ffma
        temp_456 = fma(temp_83, gsys_environment.data[45].y, gsys_environment.data[45].w);
        // 0x000B88: 0xD826022FF2972828 Texs
        temp_457 = texture(cTex_MinusFieldDarkness, vec2(temp_455, temp_456)).y;
        // 0x000B90: 0x4C9807A40B07002C Mov
        // 0x000B98: 0x4C9807A40B87002D Mov
        // 0x000BA8: 0x4C9807A40B97002A Mov
        // 0x000BB0: 0x4C9807A40B27002E Mov
        // 0x000BB8: 0x51A416240B173D2C Ffma
        temp_458 = fma(temp_451, gsys_environment.data[44].x, gsys_environment.data[44].y);
        temp_459 = clamp(temp_458, 0.0, 1.0);
        // 0x000BC8: 0x3859103F80072D2D Fadd
        temp_460 = 0.0 - gsys_environment.data[46].x;
        temp_461 = temp_460 + 1.0;
        // 0x000BD0: 0x4C5910240BA72A2A Fadd
        temp_462 = 0.0 - gsys_environment.data[46].y;
        temp_463 = temp_462 + gsys_environment.data[46].z;
        // 0x000BD8: 0x51A417240B373D2E Ffma
        temp_464 = fma(temp_451, gsys_environment.data[44].z, gsys_environment.data[44].w);
        temp_465 = clamp(temp_464, 0.0, 1.0);
        // 0x000BE8: 0x59A1168002D72C2C Ffma
        temp_466 = 0.0 - temp_461;
        temp_467 = fma(temp_459, temp_466, temp_461);
        // 0x000BF0: 0x3859103F80072E2E Fadd
        temp_468 = 0.0 - temp_465;
        temp_469 = temp_468 + 1.0;
        // 0x000BF8: 0xF0F0000034170000 Depbar
        // 0x000C08: 0x4C5810240B872C43 Fadd
        temp_470 = temp_467 + gsys_environment.data[46].x;
        // 0x000C10: 0x51A014240B972A28 Ffma
        temp_471 = fma(temp_463, temp_457, gsys_environment.data[46].y);
        // 0x000C18: 0x59A4218002E72843 Ffma
        temp_472 = fma(temp_471, temp_469, temp_470);
        temp_473 = clamp(temp_472, 0.0, 1.0);
        temp_203 = temp_473;
    }
    temp_474 = temp_203;
    // 0x000C28: 0xF0F800000007000F Sync
    // 0x000C30: 0x5C20038002472228 Imnmx
    temp_475 = min(temp_448, temp_450);
    // 0x000C38: 0xE290000106000000 Ssy
    // 0x000C48: 0x088BB03126F72529 Fadd32i
    temp_476 = uintBitsToFloat(temp_449) + -0.00200000009;
    // 0x000C50: 0xEF17700CF0271625 Shfl
    // 0x000C58: 0x5C20078001271818 Imnmx
    temp_477 = max(temp_421, temp_437);
    // 0x000C68: 0xEF17700CF0270C12 Shfl
    // 0x000C70: 0x088BB03126F72828 Fadd32i
    temp_478 = uintBitsToFloat(temp_475) + -0.00200000009;
    // 0x000C78: 0x5C20078002172621 Imnmx
    temp_479 = max(temp_446, uint(temp_445));
    // 0x000C88: 0xEF17700CF0272B26 Shfl
    // 0x000C90: 0x5C20078002472222 Imnmx
    temp_480 = max(temp_448, temp_450);
    // 0x000C98: 0xEF17700CF0171624 Shfl
    // 0x000CA8: 0x5C6017800287FF28 Fmnmx
    temp_481 = max(0.0, temp_478);
    // 0x000CB0: 0x5C68100002070F20 Fmul
    temp_482 = temp_142 * temp_270;
    // 0x000CB8: 0x5C6017800297FF2A Fmnmx
    temp_483 = max(0.0, temp_476);
    // 0x000CC8: 0x4C68103400B72323 Fmul
    temp_484 = temp_185 * gsys_scene_material.data[2].w;
    // 0x000CD0: 0x5C60178001971E29 Fmnmx
    temp_485 = max(temp_330, temp_426);
    // 0x000CD8: 0xEF17700CF0170C19 Shfl
    // 0x000CE8: 0x5C58300002872246 Fadd
    temp_486 = 0.0 - temp_481;
    temp_487 = uintBitsToFloat(temp_480) + temp_486;
    // 0x000CF0: 0xEF17700CF0172B1E Shfl
    // 0x000CF8: 0x5C58300002A71845 Fadd
    temp_488 = 0.0 - temp_483;
    temp_489 = uintBitsToFloat(temp_477) + temp_488;
    // 0x000D08: 0x5C58300002872128 Fadd
    temp_490 = 0.0 - temp_481;
    temp_491 = uintBitsToFloat(temp_479) + temp_490;
    // 0x000D10: 0x5C58300002A7152A Fadd
    temp_492 = 0.0 - temp_483;
    temp_493 = uintBitsToFloat(temp_444) + temp_492;
    // 0x000D18: 0x59A0100004771120 Ffma
    temp_494 = fma(temp_148, temp_284, temp_482);
    // 0x000D28: 0x36B683BF80072907 Fsetp
    temp_495 = temp_485 >= 1.0;
    // 0x000D30: 0x5C5810000287460F Fadd
    temp_496 = temp_487 + temp_491;
    // 0x000D38: 0x5C58100002A7452C Fadd
    temp_497 = temp_489 + temp_493;
    // 0x000D48: 0x5080000000470F0F Mufu
    temp_498 = 1.0 / temp_496;
    // 0x000D50: 0x59A0100000171320 Ffma
    temp_499 = fma(temp_154, temp_286, temp_494);
    // 0x000D58: 0x5080000000871A13 Mufu
    temp_500 = sqrt(temp_54);
    // 0x000D68: 0x50F8000A51672511 Fswzadd
    temp_501 = dFdy(temp_45);
    // 0x000D70: 0x5080000000472C2C Mufu
    temp_502 = 1.0 / temp_497;
    // 0x000D78: 0x50F8000A50C71225 Fswzadd
    temp_503 = dFdy(temp_435);
    // 0x000D88: 0x0103F8000007F012 Mov32i
    // 0x000D90: 0x50F8000A52B72626 Fswzadd
    temp_504 = dFdy(temp_46);
    // 0x000D98: 0x59A0100003370D01 Ffma
    temp_505 = fma(temp_165, temp_291, temp_499);
    // 0x000DA8: 0x50F8000991672424 Fswzadd
    temp_506 = dFdx(temp_45);
    // 0x000DB0: 0x5C68100001171411 Fmul
    temp_507 = 1.0 * temp_501;
    // 0x000DB8: 0x50F8000990C7190D Fswzadd
    temp_508 = dFdx(temp_435);
    // 0x000DC8: 0x5C68100000F74646 Fmul
    temp_509 = temp_487 * temp_498;
    // 0x000DD0: 0x5C68100000F72847 Fmul
    temp_510 = temp_491 * temp_498;
    // 0x000DD8: 0x5C68100002C74545 Fmul
    temp_511 = temp_489 * temp_502;
    // 0x000DE8: 0x50F8000992B71E33 Fswzadd
    temp_512 = dFdx(temp_46);
    // 0x000DF0: 0x5C68100002C72A44 Fmul
    temp_513 = temp_493 * temp_502;
    // 0x000DF8: 0x5C6810000257141E Fmul
    temp_514 = 1.0 * temp_503;
    // 0x000E08: 0x5C6810000267140F Fmul
    temp_515 = 1.0 * temp_504;
    // 0x000E10: 0xE24000005488000F Bra
    if (temp_495)
    {
        // 0x000E18: 0x3848000000471C14 Shl
        temp_516 = temp_276 << 4;
        // 0x000E28: 0x5CB8000001D70A24 I2f
        temp_517 = float(temp_331);
        // 0x000E30: 0x5C5930000FF71619 Fadd
        temp_518 = 0.0 - temp_45;
        temp_519 = temp_518 + -0.0;
        // 0x000E38: 0x5CB8000001070A20 I2f
        temp_520 = float(temp_333);
        // 0x000E48: 0x3848000000471D11 Shl
        temp_521 = int(temp_331) << 4;
        // 0x000E50: 0x5CB8000001C70A18 I2f
        temp_522 = float(uint(temp_276));
        // 0x000E58: 0x5C5930000FF70C0C Fadd
        temp_523 = 0.0 - temp_435;
        temp_524 = temp_523 + -0.0;
        // 0x000E68: 0xEF9400E061071422 Ldc
        temp_525 = temp_516 + 0x610;
        temp_526 = uint(temp_525) >> 2;
        temp_527 = temp_526 >> 2;
        temp_528 = int(temp_526) & 3;
        temp_529 = static_data_ubo.data[int(temp_527)][temp_528];
        // 0x000E70: 0x384800000047100D Shl
        temp_530 = int(temp_333) << 4;
        // 0x000E78: 0xEF9400E06107111E Ldc
        temp_531 = temp_521 + 0x610;
        temp_532 = uint(temp_531) >> 2;
        temp_533 = temp_532 >> 2;
        temp_534 = int(temp_532) & 3;
        temp_535 = static_data_ubo.data[int(temp_533)][temp_534];
        // 0x000E88: 0x3800000020071515 Bfe
        temp_536 = bitfieldExtract(temp_444, 0, 2);
        // 0x000E90: 0xEF9400E061070D0F Ldc
        temp_537 = temp_530 + 0x610;
        temp_538 = uint(temp_537) >> 2;
        temp_539 = temp_538 >> 2;
        temp_540 = int(temp_538) & 3;
        temp_541 = static_data_ubo.data[int(temp_539)][temp_540];
        // 0x000E98: 0x380100001017151A Bfe
        temp_542 = bitfieldExtract(int(temp_536), 1, 1);
        // 0x000EA8: 0x5CB0100002470924 F2i
        temp_543 = roundEven(temp_517);
        temp_544 = max(temp_543, 0.0);
        temp_545 = uint(temp_544);
        temp_546 = clamp(temp_545, 0u, 0xFFFFu);
        // 0x000EB0: 0x3801000010071516 Bfe
        temp_547 = bitfieldExtract(int(temp_536), 0, 1);
        // 0x000EB8: 0x5CB0100002070920 F2i
        temp_548 = roundEven(temp_520);
        temp_549 = max(temp_548, 0.0);
        temp_550 = uint(temp_549);
        temp_551 = clamp(temp_550, 0u, 0xFFFFu);
        // 0x000EC8: 0x5BE7158B81A70C0C Lop3
        temp_552 = temp_542 & floatBitsToInt(temp_46);
        temp_553 = ~temp_542;
        temp_554 = temp_553 & floatBitsToInt(temp_524);
        temp_555 = temp_552 | temp_554;
        // 0x000ED0: 0x5CB0100001870918 F2i
        temp_556 = roundEven(temp_522);
        temp_557 = max(temp_556, 0.0);
        temp_558 = uint(temp_557);
        temp_559 = clamp(temp_558, 0u, 0xFFFFu);
        // 0x000ED8: 0x5BE7158B81671919 Lop3
        temp_560 = temp_547 & floatBitsToInt(temp_46);
        temp_561 = ~temp_547;
        temp_562 = temp_561 & floatBitsToInt(temp_519);
        temp_563 = temp_560 | temp_562;
        // 0x000EE8: 0x5C68100001E70C32 Fmul
        temp_564 = intBitsToFloat(temp_555) * temp_535;
        // 0x000EF0: 0x5C68100001E71925 Fmul
        temp_565 = intBitsToFloat(temp_563) * temp_535;
        // 0x000EF8: 0xD8E0028263272410 Texs
        temp_566 = texture(cTexture1, vec3(temp_565, temp_564, float(int(temp_546)))).xyz;
        temp_567 = temp_566.x;
        temp_568 = temp_566.y;
        temp_569 = temp_566.z;
        // 0x000F08: 0x5C68100000F70C2E Fmul
        temp_570 = intBitsToFloat(temp_555) * temp_541;
        // 0x000F10: 0x5C68100000F71921 Fmul
        temp_571 = intBitsToFloat(temp_563) * temp_541;
        // 0x000F18: 0x5C68100002270C33 Fmul
        temp_572 = intBitsToFloat(temp_555) * temp_529;
        // 0x000F28: 0x5C68100002271919 Fmul
        temp_573 = intBitsToFloat(temp_563) * temp_529;
        // 0x000F30: 0xD8E0028222E72014 Texs
        temp_574 = texture(cTexture1, vec3(temp_571, temp_570, float(int(temp_551)))).xyz;
        temp_575 = temp_574.x;
        temp_576 = temp_574.y;
        temp_577 = temp_574.z;
        // 0x000F38: 0xD8E00280F337180C Texs
        temp_578 = texture(cTexture1, vec3(temp_573, temp_572, float(int(temp_559)))).xyz;
        temp_579 = temp_578.x;
        temp_580 = temp_578.y;
        temp_581 = temp_578.z;
        // 0x000F48: 0xD8E20261E327241C Texs
        temp_582 = texture(cTexture0, vec3(temp_565, temp_564, float(int(temp_546)))).xyz;
        temp_583 = temp_582.x;
        temp_584 = temp_582.y;
        temp_585 = temp_582.z;
        // 0x000F50: 0xD8E20262C2E72028 Texs
        temp_586 = texture(cTexture0, vec3(temp_571, temp_570, float(int(temp_551)))).xyz;
        temp_587 = temp_586.x;
        temp_588 = temp_586.y;
        temp_589 = temp_586.z;
        // 0x000F58: 0xD8E20262D337182A Texs
        temp_590 = texture(cTexture0, vec3(temp_573, temp_572, float(int(temp_559)))).xyz;
        temp_591 = temp_590.x;
        temp_592 = temp_590.y;
        temp_593 = temp_590.z;
        // 0x000F68: 0x5C60138001F70230 Fmnmx
        temp_594 = min(temp_433, temp_436);
        // 0x000F70: 0x5C5930000FF70434 Fadd
        temp_595 = 0.0 - temp_287;
        temp_596 = temp_595 + -0.0;
        // 0x000F78: 0x5C5930000FF70535 Fadd
        temp_597 = 0.0 - temp_289;
        temp_598 = temp_597 + -0.0;
        // 0x000F88: 0x5C60138003070E30 Fmnmx
        temp_599 = min(temp_434, temp_594);
        // 0x000F90: 0x088BB03126F73031 Fadd32i
        temp_600 = temp_599 + -0.00200000009;
        // 0x000F98: 0x5BE7020B81A70330 Lop3
        temp_601 = temp_542 & floatBitsToInt(temp_287);
        temp_602 = ~temp_542;
        temp_603 = temp_602 & floatBitsToInt(temp_288);
        temp_604 = temp_601 | temp_603;
        // 0x000FA8: 0x5BE7018B81A73404 Lop3
        temp_605 = temp_542 & floatBitsToInt(temp_288);
        temp_606 = ~temp_542;
        temp_607 = temp_606 & floatBitsToInt(temp_596);
        temp_608 = temp_605 | temp_607;
        // 0x000FB0: 0x5BE7018B81673503 Lop3
        temp_609 = temp_547 & floatBitsToInt(temp_288);
        temp_610 = ~temp_547;
        temp_611 = temp_610 & floatBitsToInt(temp_598);
        temp_612 = temp_609 | temp_611;
        // 0x000FB8: 0x5C6017800317FF31 Fmnmx
        temp_613 = max(0.0, temp_600);
        // 0x000FC8: 0x5BE7028B81673005 Lop3
        temp_614 = temp_547 & floatBitsToInt(temp_289);
        temp_615 = ~temp_547;
        temp_616 = temp_615 & temp_604;
        temp_617 = temp_614 | temp_616;
        // 0x000FD0: 0x5C58300003170224 Fadd
        temp_618 = 0.0 - temp_613;
        temp_619 = temp_433 + temp_618;
        // 0x000FD8: 0x5C58300003171F19 Fadd
        temp_620 = 0.0 - temp_613;
        temp_621 = temp_436 + temp_620;
        // 0x000FE8: 0x5C58300003170E0E Fadd
        temp_622 = 0.0 - temp_613;
        temp_623 = temp_434 + temp_622;
        // 0x000FF0: 0x5C68100002472424 Fmul
        temp_624 = temp_619 * temp_619;
        // 0x000FF8: 0x5C68100001971921 Fmul
        temp_625 = temp_621 * temp_621;
        // 0x001008: 0xF0F0000034570000 Depbar
        // 0x001010: 0x32A2094000071010 Ffma
        temp_626 = fma(temp_567, 2.0, -1.0);
        // 0x001018: 0x32A2094000071111 Ffma
        temp_627 = fma(temp_568, 2.0, -1.0);
        // 0x001028: 0x49A0130400672620 Ffma
        temp_628 = fma(temp_569, fp_c1.data[1].z, temp_569);
        // 0x001030: 0x5C68100001071018 Fmul
        temp_629 = temp_626 * temp_626;
        // 0x001038: 0x0883D4CCCCD72020 Fadd32i
        temp_630 = temp_628 + 0.0500000007;
        // 0x001048: 0x59A00C0001171118 Ffma
        temp_631 = fma(temp_627, temp_627, temp_629);
        // 0x001050: 0x385D103F80071818 Fadd
        temp_632 = 0.0 - temp_631;
        temp_633 = temp_632 + 1.0;
        temp_634 = clamp(temp_633, 0.0, 1.0);
        // 0x001058: 0xF0F0000034370000 Depbar
        // 0x001068: 0x32A2094000071414 Ffma
        temp_635 = fma(temp_575, 2.0, -1.0);
        // 0x001070: 0x32A2094000071515 Ffma
        temp_636 = fma(temp_576, 2.0, -1.0);
        // 0x001078: 0x32A2094000070C0C Ffma
        temp_637 = fma(temp_579, 2.0, -1.0);
        // 0x001088: 0x32A2094000070D0D Ffma
        temp_638 = fma(temp_580, 2.0, -1.0);
        // 0x001090: 0x5080000000871812 Mufu
        temp_639 = sqrt(temp_634);
        // 0x001098: 0x49A0110400672225 Ffma
        temp_640 = fma(temp_577, fp_c1.data[1].z, temp_577);
        // 0x0010A8: 0x5C68100001471402 Fmul
        temp_641 = temp_635 * temp_635;
        // 0x0010B0: 0x5C68100000C70C1F Fmul
        temp_642 = temp_637 * temp_637;
        // 0x0010B8: 0x0883D4CCCCD72525 Fadd32i
        temp_643 = temp_640 + 0.0500000007;
        // 0x0010C8: 0x59A0010001571502 Ffma
        temp_644 = fma(temp_636, temp_636, temp_641);
        // 0x0010D0: 0x59A00F8000D70D1F Ffma
        temp_645 = fma(temp_638, temp_638, temp_642);
        // 0x0010D8: 0x59A109000107032E Ffma
        temp_646 = 0.0 - temp_626;
        temp_647 = fma(intBitsToFloat(temp_612), temp_646, temp_639);
        // 0x0010E8: 0x385D103F80070202 Fadd
        temp_648 = 0.0 - temp_644;
        temp_649 = temp_648 + 1.0;
        temp_650 = clamp(temp_649, 0.0, 1.0);
        // 0x0010F0: 0x5080000000870202 Mufu
        temp_651 = sqrt(temp_650);
        // 0x0010F8: 0x385D103F80071F19 Fadd
        temp_652 = 0.0 - temp_645;
        temp_653 = temp_652 + 1.0;
        temp_654 = clamp(temp_653, 0.0, 1.0);
        // 0x001108: 0x59A017000117042E Ffma
        temp_655 = fma(intBitsToFloat(temp_608), temp_627, temp_647);
        // 0x001110: 0x5080000000871919 Mufu
        temp_656 = sqrt(temp_654);
        // 0x001118: 0x5C6810000217201F Fmul
        temp_657 = temp_630 * temp_625;
        // 0x001128: 0x5C68100000E70E21 Fmul
        temp_658 = temp_623 * temp_623;
        // 0x001130: 0x49A0078400670F20 Ffma
        temp_659 = fma(temp_581, fp_c1.data[1].z, temp_581);
        // 0x001138: 0x59A0080002E7030E Ffma
        temp_660 = fma(intBitsToFloat(temp_612), temp_655, temp_626);
        // 0x001148: 0x59A2088002E70411 Ffma
        temp_661 = 0.0 - temp_627;
        temp_662 = fma(intBitsToFloat(temp_608), temp_655, temp_661);
        // 0x001150: 0x5C68100002E7052E Fmul
        temp_663 = intBitsToFloat(temp_617) * temp_655;
        // 0x001158: 0x0883D4CCCCD72020 Fadd32i
        temp_664 = temp_659 + 0.0500000007;
        // 0x001168: 0x59A1010000371412 Ffma
        temp_665 = 0.0 - intBitsToFloat(temp_612);
        temp_666 = fma(temp_635, temp_665, temp_651);
        // 0x001170: 0x5C68100002472502 Fmul
        temp_667 = temp_643 * temp_624;
        // 0x001178: 0x5C68100001F72624 Fmul
        temp_668 = temp_569 * temp_657;
        // 0x001188: 0x59A10C8000C70326 Ffma
        temp_669 = 0.0 - temp_637;
        temp_670 = fma(intBitsToFloat(temp_612), temp_669, temp_656);
        // 0x001190: 0x5C68100001F72E19 Fmul
        temp_671 = temp_663 * temp_657;
        // 0x001198: 0x5C68100001F71118 Fmul
        temp_672 = temp_662 * temp_657;
        // 0x0011A8: 0x59A0090001570412 Ffma
        temp_673 = fma(intBitsToFloat(temp_608), temp_636, temp_666);
        // 0x0011B0: 0x5C68100001F70E11 Fmul
        temp_674 = temp_660 * temp_657;
        // 0x0011B8: 0x59A0120000272222 Ffma
        temp_675 = fma(temp_577, temp_667, temp_668);
        // 0x0011C8: 0x59A0130000D70426 Ffma
        temp_676 = fma(intBitsToFloat(temp_608), temp_638, temp_670);
        // 0x0011D0: 0x5C68100000571210 Fmul
        temp_677 = temp_673 * intBitsToFloat(temp_617);
        // 0x0011D8: 0x59A20A8001270415 Ffma
        temp_678 = 0.0 - temp_636;
        temp_679 = fma(intBitsToFloat(temp_608), temp_673, temp_678);
        // 0x0011E8: 0x59A00A0001270314 Ffma
        temp_680 = fma(intBitsToFloat(temp_612), temp_673, temp_635);
        // 0x0011F0: 0x59A206800267040E Ffma
        temp_681 = 0.0 - temp_638;
        temp_682 = fma(intBitsToFloat(temp_608), temp_676, temp_681);
        // 0x0011F8: 0x5C68100002670512 Fmul
        temp_683 = intBitsToFloat(temp_617) * temp_676;
        // 0x001208: 0x59A0060002670303 Ffma
        temp_684 = fma(intBitsToFloat(temp_612), temp_676, temp_637);
        // 0x001210: 0x59A00C8000271019 Ffma
        temp_685 = fma(temp_677, temp_667, temp_671);
        // 0x001218: 0x5C68100002172010 Fmul
        temp_686 = temp_664 * temp_658;
        // 0x001228: 0x5C58100000271F21 Fadd
        temp_687 = temp_657 + temp_667;
        // 0x001230: 0x59A00C0000271515 Ffma
        temp_688 = fma(temp_679, temp_667, temp_672);
        // 0x001238: 0x59A0088000271411 Ffma
        temp_689 = fma(temp_680, temp_667, temp_674);
        // 0x001248: 0xF0F0000034170000 Depbar
        // 0x001250: 0x5C68100001C71F05 Fmul
        temp_690 = temp_657 * temp_583;
        // 0x001258: 0x5C68100001D71F0C Fmul
        temp_691 = temp_657 * temp_584;
        // 0x001268: 0x5C68100001E71F1F Fmul
        temp_692 = temp_657 * temp_585;
        // 0x001270: 0x5C58100002171021 Fadd
        temp_693 = temp_686 + temp_687;
        // 0x001278: 0x59A00A8001070E15 Ffma
        temp_694 = fma(temp_682, temp_686, temp_688);
        // 0x001288: 0x5080000000472120 Mufu
        temp_695 = 1.0 / temp_693;
        // 0x001290: 0x59A00C8001071204 Ffma
        temp_696 = fma(temp_683, temp_686, temp_685);
        // 0x001298: 0x59A0088001070303 Ffma
        temp_697 = fma(temp_684, temp_686, temp_689);
        // 0x0012A8: 0x59A002800287020D Ffma
        temp_698 = fma(temp_667, temp_587, temp_690);
        // 0x0012B0: 0x59A0060002970229 Ffma
        temp_699 = fma(temp_667, temp_588, temp_691);
        // 0x0012B8: 0x59A00F8002C7021F Ffma
        temp_700 = fma(temp_667, temp_589, temp_692);
        // 0x0012C8: 0x59A0110001070F22 Ffma
        temp_701 = fma(temp_581, temp_686, temp_675);
        // 0x0012D0: 0x5BE70A8B81A70405 Lop3
        temp_702 = temp_542 & floatBitsToInt(temp_694);
        temp_703 = ~temp_542;
        temp_704 = temp_703 & floatBitsToInt(temp_696);
        temp_705 = temp_702 | temp_704;
        // 0x0012D8: 0x5C5930000FF7030F Fadd
        temp_706 = 0.0 - temp_697;
        temp_707 = temp_706 + -0.0;
        // 0x0012E8: 0x59A0068002A7100D Ffma
        temp_708 = fma(temp_686, temp_591, temp_698);
        // 0x0012F0: 0x59A0148002B71029 Ffma
        temp_709 = fma(temp_686, temp_592, temp_699);
        // 0x0012F8: 0x5C5930000FF71515 Fadd
        temp_710 = 0.0 - temp_694;
        temp_711 = temp_710 + -0.0;
        // 0x001308: 0x59A00F8002D7101F Ffma
        temp_712 = fma(temp_686, temp_593, temp_700);
        // 0x001310: 0x5BE7018B81670502 Lop3
        temp_713 = temp_547 & floatBitsToInt(temp_697);
        temp_714 = ~temp_547;
        temp_715 = temp_714 & temp_705;
        temp_716 = temp_713 | temp_715;
        // 0x001318: 0x5BE7020B81670F16 Lop3
        temp_717 = temp_547 & floatBitsToInt(temp_696);
        temp_718 = ~temp_547;
        temp_719 = temp_718 & floatBitsToInt(temp_707);
        temp_720 = temp_717 | temp_719;
        // 0x001328: 0x5C68100002072225 Fmul
        temp_721 = temp_701 * temp_695;
        // 0x001330: 0x5C68100002070D21 Fmul
        temp_722 = temp_708 * temp_695;
        // 0x001338: 0x5C6810000207290F Fmul
        temp_723 = temp_709 * temp_695;
        // 0x001348: 0x5BE7020B81A7151A Lop3
        temp_724 = temp_542 & floatBitsToInt(temp_696);
        temp_725 = ~temp_542;
        temp_726 = temp_725 & floatBitsToInt(temp_711);
        temp_727 = temp_724 | temp_726;
        // 0x001350: 0x5C68100002071F20 Fmul
        temp_728 = temp_712 * temp_695;
        // 0x001358: 0xF0F800000007000F Sync
        temp_729 = intBitsToFloat(temp_720);
        temp_730 = intBitsToFloat(temp_727);
        temp_731 = intBitsToFloat(temp_716);
        temp_732 = temp_721;
        temp_733 = temp_722;
        temp_734 = temp_723;
        temp_735 = temp_728;
        temp_736 = true;
    }
    else
    {
        // 0x001368: 0x3800000070272126 Bfe
        temp_737 = bitfieldExtract(temp_479, 2, 7);
        // 0x001370: 0xF0C800000127001F S2r
        // 0x001378: 0x5C5930000FF7240E Fadd
        temp_738 = 0.0 - temp_506;
        temp_739 = temp_738 + -0.0;
        // 0x001388: 0x3800000070272222 Bfe
        temp_740 = bitfieldExtract(temp_480, 2, 7);
        // 0x001390: 0x5C5930000FF70D0D Fadd
        temp_741 = 0.0 - temp_508;
        temp_742 = temp_741 + -0.0;
        // 0x001398: 0x3800000020071515 Bfe
        temp_743 = bitfieldExtract(temp_444, 0, 2);
        // 0x0013A8: 0x5C5930000FF7111A Fadd
        temp_744 = 0.0 - temp_507;
        temp_745 = temp_744 + -0.0;
        // 0x0013B0: 0x3848000000472619 Shl
        temp_746 = int(temp_737) << 4;
        // 0x0013B8: 0x5CB8000002670A26 I2f
        temp_747 = float(temp_737);
        // 0x0013C8: 0x5C5930000FF71E24 Fadd
        temp_748 = 0.0 - temp_514;
        temp_749 = temp_748 + -0.0;
        // 0x0013D0: 0xEF9400E061071919 Ldc
        temp_750 = temp_746 + 0x610;
        temp_751 = uint(temp_750) >> 2;
        temp_752 = temp_751 >> 2;
        temp_753 = int(temp_751) & 3;
        temp_754 = static_data_ubo.data[int(temp_752)][temp_753];
        // 0x0013D8: 0x3848000000472221 Shl
        temp_755 = int(temp_740) << 4;
        // 0x0013E8: 0x5CB0100002670926 F2i
        temp_756 = roundEven(temp_747);
        temp_757 = max(temp_756, 0.0);
        temp_758 = uint(temp_757);
        temp_759 = clamp(temp_758, 0u, 0xFFFFu);
        // 0x0013F0: 0x3800000020071818 Bfe
        temp_760 = bitfieldExtract(temp_477, 0, 2);
        // 0x0013F8: 0xEF9400E061072121 Ldc
        temp_761 = temp_755 + 0x610;
        temp_762 = uint(temp_761) >> 2;
        temp_763 = temp_762 >> 2;
        temp_764 = int(temp_762) & 3;
        temp_765 = static_data_ubo.data[int(temp_763)][temp_764];
        // 0x001408: 0x3801000010071539 Bfe
        temp_766 = bitfieldExtract(int(temp_743), 0, 1);
        // 0x001410: 0x5C5930000FF7162A Fadd
        temp_767 = 0.0 - temp_45;
        temp_768 = temp_767 + -0.0;
        // 0x001418: 0x3801000010171502 Bfe
        temp_769 = bitfieldExtract(int(temp_743), 1, 1);
        // 0x001428: 0x3801000010071838 Bfe
        temp_770 = bitfieldExtract(int(temp_760), 0, 1);
        // 0x001430: 0x5BE7198B83970E10 Lop3
        temp_771 = temp_766 & floatBitsToInt(temp_512);
        temp_772 = ~temp_766;
        temp_773 = temp_772 & floatBitsToInt(temp_739);
        temp_774 = temp_771 | temp_773;
        // 0x001438: 0x380100001017183A Bfe
        temp_775 = bitfieldExtract(int(temp_760), 1, 1);
        // 0x001448: 0x5BE7158B83972A2C Lop3
        temp_776 = temp_766 & floatBitsToInt(temp_46);
        temp_777 = ~temp_766;
        temp_778 = temp_777 & floatBitsToInt(temp_768);
        temp_779 = temp_776 | temp_778;
        // 0x001450: 0x5C9807800267002E Mov
        // 0x001458: 0x5BE7198B83870E1C Lop3
        temp_780 = temp_770 & floatBitsToInt(temp_512);
        temp_781 = ~temp_770;
        temp_782 = temp_781 & floatBitsToInt(temp_739);
        temp_783 = temp_780 | temp_782;
        // 0x001468: 0x5BE7198B80270D0E Lop3
        temp_784 = temp_769 & floatBitsToInt(temp_512);
        temp_785 = ~temp_769;
        temp_786 = temp_785 & floatBitsToInt(temp_742);
        temp_787 = temp_784 | temp_786;
        // 0x001470: 0x5BE7198B83A70D1E Lop3
        temp_788 = temp_775 & floatBitsToInt(temp_512);
        temp_789 = ~temp_775;
        temp_790 = temp_789 & floatBitsToInt(temp_742);
        temp_791 = temp_788 | temp_790;
        // 0x001478: 0x5C5930000FF70C0D Fadd
        temp_792 = 0.0 - temp_435;
        temp_793 = temp_792 + -0.0;
        // 0x001488: 0x5BE7078B83971A0C Lop3
        temp_794 = temp_766 & floatBitsToInt(temp_515);
        temp_795 = ~temp_766;
        temp_796 = temp_795 & floatBitsToInt(temp_745);
        temp_797 = temp_794 | temp_796;
        // 0x001490: 0x5BE7078B83871A16 Lop3
        temp_798 = temp_770 & floatBitsToInt(temp_515);
        temp_799 = ~temp_770;
        temp_800 = temp_799 & floatBitsToInt(temp_745);
        temp_801 = temp_798 | temp_800;
        // 0x001498: 0x5BE7078B8027241A Lop3
        temp_802 = temp_769 & floatBitsToInt(temp_515);
        temp_803 = ~temp_769;
        temp_804 = temp_803 & floatBitsToInt(temp_749);
        temp_805 = temp_802 | temp_804;
        // 0x0014A8: 0x5BE7078B83A72424 Lop3
        temp_806 = temp_775 & floatBitsToInt(temp_515);
        temp_807 = ~temp_775;
        temp_808 = temp_807 & floatBitsToInt(temp_749);
        temp_809 = temp_806 | temp_808;
        // 0x0014B0: 0x5BE7158B83872A20 Lop3
        temp_810 = temp_770 & floatBitsToInt(temp_46);
        temp_811 = ~temp_770;
        temp_812 = temp_811 & floatBitsToInt(temp_768);
        temp_813 = temp_810 | temp_812;
        // 0x0014B8: 0x5BE7158B80270D18 Lop3
        temp_814 = temp_769 & floatBitsToInt(temp_46);
        temp_815 = ~temp_769;
        temp_816 = temp_815 & floatBitsToInt(temp_793);
        temp_817 = temp_814 | temp_816;
        // 0x0014C8: 0x5BE7158B83A70D0F Lop3
        temp_818 = temp_775 & floatBitsToInt(temp_46);
        temp_819 = ~temp_775;
        temp_820 = temp_819 & floatBitsToInt(temp_793);
        temp_821 = temp_818 | temp_820;
        // 0x0014D0: 0x5C68100001A7192B Fmul
        temp_822 = temp_754 * intBitsToFloat(temp_805);
        // 0x0014D8: 0x5C68100001671931 Fmul
        temp_823 = temp_754 * intBitsToFloat(temp_801);
        // 0x0014E8: 0x5C68100000C71929 Fmul
        temp_824 = temp_754 * intBitsToFloat(temp_797);
        // 0x0014F0: 0x5C68100001871925 Fmul
        temp_825 = temp_754 * intBitsToFloat(temp_817);
        // 0x0014F8: 0x5C68100001971028 Fmul
        temp_826 = intBitsToFloat(temp_774) * temp_754;
        // 0x001508: 0x5C68100001970E2A Fmul
        temp_827 = intBitsToFloat(temp_787) * temp_754;
        // 0x001510: 0x5C68100001C71930 Fmul
        temp_828 = temp_754 * intBitsToFloat(temp_783);
        // 0x001518: 0x5C68100001E71932 Fmul
        temp_829 = temp_754 * intBitsToFloat(temp_791);
        // 0x001528: 0x5C68100001472929 Fmul
        temp_830 = temp_824 * 1.0;
        // 0x001530: 0x5C68100001472B2B Fmul
        temp_831 = temp_822 * 1.0;
        // 0x001538: 0x5C68100001F73131 Fmul
        temp_832 = temp_823 * 1.0;
        // 0x001548: 0x5C6810000217161D Fmul
        temp_833 = intBitsToFloat(temp_801) * temp_765;
        // 0x001550: 0x5C68100002170C0D Fmul
        temp_834 = intBitsToFloat(temp_797) * temp_765;
        // 0x001558: 0x5C68100002171A1A Fmul
        temp_835 = intBitsToFloat(temp_805) * temp_765;
        // 0x001568: 0x5C68100002471916 Fmul
        temp_836 = temp_754 * intBitsToFloat(temp_809);
        // 0x001570: 0x5C68100002172415 Fmul
        temp_837 = intBitsToFloat(temp_809) * temp_765;
        // 0x001578: 0x5C68100002171811 Fmul
        temp_838 = intBitsToFloat(temp_817) * temp_765;
        // 0x001588: 0x5C6810000217100C Fmul
        temp_839 = intBitsToFloat(temp_774) * temp_765;
        // 0x001590: 0x5C68100002071918 Fmul
        temp_840 = temp_754 * intBitsToFloat(temp_813);
        // 0x001598: 0x5C68100002170E0E Fmul
        temp_841 = intBitsToFloat(temp_787) * temp_765;
        // 0x0015A8: 0x5C68100002C71924 Fmul
        temp_842 = temp_754 * intBitsToFloat(temp_779);
        // 0x0015B0: 0x5C68100002172C10 Fmul
        temp_843 = intBitsToFloat(temp_779) * temp_765;
        // 0x0015B8: 0x5C68100002171C1C Fmul
        temp_844 = intBitsToFloat(temp_783) * temp_765;
        // 0x0015C8: 0x5C68100002171E1E Fmul
        temp_845 = intBitsToFloat(temp_791) * temp_765;
        // 0x0015D0: 0x5C68100002172020 Fmul
        temp_846 = intBitsToFloat(temp_813) * temp_765;
        // 0x0015D8: 0x5C68100000F71919 Fmul
        temp_847 = temp_754 * intBitsToFloat(temp_821);
        // 0x0015E8: 0x5C68100002170F21 Fmul
        temp_848 = intBitsToFloat(temp_821) * temp_765;
        // 0x0015F0: 0x5C68100001F70D0D Fmul
        temp_849 = temp_834 * 1.0;
        // 0x0015F8: 0x5C68100001F71A0F Fmul
        temp_850 = temp_835 * 1.0;
        // 0x001608: 0x5C68100001F71633 Fmul
        temp_851 = temp_836 * 1.0;
        // 0x001610: 0x5C68100001F71D1D Fmul
        temp_852 = temp_833 * 1.0;
        // 0x001618: 0x5C68100001F7151F Fmul
        temp_853 = temp_837 * 1.0;
        // 0x001628: 0xDE380283B2872414 Txd
        temp_854 = int(temp_759) & 0xFFFF;
        temp_855 = textureGrad(cTexture1, vec3(temp_842, temp_825, float(temp_854)), vec2(temp_826, temp_830), vec2(temp_827, temp_831)).xyz;
        temp_856 = temp_855.x;
        temp_857 = temp_855.y;
        temp_858 = temp_855.z;
        // 0x001630: 0x5C9807800267001A Mov
        // 0x001638: 0x5C9807800187002C Mov
        // 0x001648: 0x5C9807800197002D Mov
        // 0x001650: 0xDE380283B3071818 Txd
        temp_859 = int(temp_759) & 0xFFFF;
        temp_860 = textureGrad(cTexture1, vec3(temp_840, temp_847, float(temp_859)), vec2(temp_828, temp_832), vec2(temp_829, temp_851)).xyz;
        temp_861 = temp_860.x;
        temp_862 = temp_860.y;
        temp_863 = temp_860.z;
        // 0x001658: 0xDE3A0263B3072C2C Txd
        temp_864 = int(temp_759) & 0xFFFF;
        temp_865 = textureGrad(cTexture0, vec3(temp_840, temp_847, float(temp_864)), vec2(temp_828, temp_832), vec2(temp_829, temp_851)).xyz;
        temp_866 = temp_865.x;
        temp_867 = temp_865.y;
        temp_868 = temp_865.z;
        // 0x001668: 0xDE3A0263B2872434 Txd
        temp_869 = int(temp_759) & 0xFFFF;
        temp_870 = textureGrad(cTexture0, vec3(temp_842, temp_825, float(temp_869)), vec2(temp_826, temp_830), vec2(temp_827, temp_831)).xyz;
        temp_871 = temp_870.x;
        temp_872 = temp_870.y;
        temp_873 = temp_870.z;
        // 0x001670: 0x5C68100004774525 Fmul
        temp_874 = temp_511 * temp_510;
        // 0x001678: 0x5CB8000002270A31 I2f
        temp_875 = float(temp_740);
        // 0x001688: 0x5C68100004474747 Fmul
        temp_876 = temp_510 * temp_513;
        // 0x001690: 0x5C68100004474644 Fmul
        temp_877 = temp_509 * temp_513;
        // 0x001698: 0x0103F8000007F02B Mov32i
        // 0x0016A8: 0x5C68100002572526 Fmul
        temp_878 = temp_874 * temp_874;
        // 0x0016B0: 0x5C68100004774728 Fmul
        temp_879 = temp_876 * temp_876;
        // 0x0016B8: 0xF0F0000034270000 Depbar
        // 0x0016C8: 0x32A2094000071424 Ffma
        temp_880 = fma(temp_856, 2.0, -1.0);
        // 0x0016D0: 0x5C68100004574614 Fmul
        temp_881 = temp_509 * temp_511;
        // 0x0016D8: 0x32A2094000071545 Ffma
        temp_882 = fma(temp_857, 2.0, -1.0);
        // 0x0016E8: 0x49A00D0400671A15 Ffma
        temp_883 = fma(temp_863, fp_c1.data[1].z, temp_863);
        // 0x0016F0: 0x49A00B0400671646 Ffma
        temp_884 = fma(temp_858, fp_c1.data[1].z, temp_858);
        // 0x0016F8: 0x5C68100002472412 Fmul
        temp_885 = temp_880 * temp_880;
        // 0x001708: 0x5C5930000FF74529 Fadd
        temp_886 = 0.0 - temp_882;
        temp_887 = temp_886 + -0.0;
        // 0x001710: 0x0883D4CCCCD71515 Fadd32i
        temp_888 = temp_883 + 0.0500000007;
        // 0x001718: 0x0883D4CCCCD74633 Fadd32i
        temp_889 = temp_884 + 0.0500000007;
        // 0x001728: 0x5C5930000FF70546 Fadd
        temp_890 = 0.0 - temp_289;
        temp_891 = temp_890 + -0.0;
        // 0x001730: 0x59A0090004574512 Ffma
        temp_892 = fma(temp_882, temp_882, temp_885);
        // 0x001738: 0x5C68100002671515 Fmul
        temp_893 = temp_888 * temp_878;
        // 0x001748: 0x5C68100002873333 Fmul
        temp_894 = temp_889 * temp_879;
        // 0x001750: 0x32A215C000071928 Ffma
        temp_895 = fma(temp_862, 2.0, -1.0);
        // 0x001758: 0x385D103F80071225 Fadd
        temp_896 = 0.0 - temp_892;
        temp_897 = temp_896 + 1.0;
        temp_898 = clamp(temp_897, 0.0, 1.0);
        // 0x001768: 0x5C5930000FF70512 Fadd
        temp_899 = 0.0 - temp_289;
        temp_900 = temp_899 + -0.0;
        // 0x001770: 0x5080000000872525 Mufu
        temp_901 = sqrt(temp_898);
        // 0x001778: 0x5BE7018B83874647 Lop3
        temp_902 = temp_770 & floatBitsToInt(temp_288);
        temp_903 = ~temp_770;
        temp_904 = temp_903 & floatBitsToInt(temp_891);
        temp_905 = temp_902 | temp_904;
        // 0x001788: 0x5BE7018B83971226 Lop3
        temp_906 = temp_766 & floatBitsToInt(temp_288);
        temp_907 = ~temp_766;
        temp_908 = temp_907 & floatBitsToInt(temp_900);
        temp_909 = temp_906 | temp_908;
        // 0x001790: 0x32A215C000071812 Ffma
        temp_910 = fma(temp_861, 2.0, -1.0);
        // 0x001798: 0x59A1128002472618 Ffma
        temp_911 = 0.0 - temp_880;
        temp_912 = fma(intBitsToFloat(temp_909), temp_911, temp_901);
        // 0x0017A8: 0x5C5930000FF70425 Fadd
        temp_913 = 0.0 - temp_287;
        temp_914 = temp_913 + -0.0;
        // 0x0017B0: 0x5C68100001271219 Fmul
        temp_915 = temp_910 * temp_910;
        // 0x0017B8: 0x5C47000002970226 Lop
        temp_916 = temp_769 & floatBitsToInt(temp_887);
        // 0x0017C8: 0x5BE7018B8027252A Lop3
        temp_917 = temp_769 & floatBitsToInt(temp_288);
        temp_918 = ~temp_769;
        temp_919 = temp_918 & floatBitsToInt(temp_914);
        temp_920 = temp_917 | temp_919;
        // 0x0017D0: 0x59A00C8002872819 Ffma
        temp_921 = fma(temp_895, temp_895, temp_915);
        // 0x0017D8: 0x5BE7120B83972625 Lop3
        temp_922 = temp_766 & floatBitsToInt(temp_880);
        temp_923 = ~temp_766;
        temp_924 = temp_923 & temp_916;
        temp_925 = temp_922 | temp_924;
        // 0x0017E8: 0x5C5930000FF72424 Fadd
        temp_926 = 0.0 - temp_880;
        temp_927 = temp_926 + -0.0;
        // 0x0017F0: 0x59A00C0004572A26 Ffma
        temp_928 = fma(intBitsToFloat(temp_920), temp_882, temp_912);
        // 0x0017F8: 0x385D103F80071929 Fadd
        temp_929 = 0.0 - temp_921;
        temp_930 = temp_929 + 1.0;
        temp_931 = clamp(temp_930, 0.0, 1.0);
        // 0x001808: 0x5BE701050FF74545 Lop3
        temp_932 = ~temp_769;
        temp_933 = temp_932 & floatBitsToInt(temp_882);
        // 0x001810: 0x5080000000872929 Mufu
        temp_934 = sqrt(temp_931);
        // 0x001818: 0x5BE71C850FF72418 Lop3
        temp_935 = ~temp_766;
        temp_936 = temp_935 & floatBitsToInt(temp_927);
        // 0x001828: 0x5C5930000FF7122A Fadd
        temp_937 = 0.0 - temp_910;
        temp_938 = temp_937 + -0.0;
        // 0x001830: 0x59A0128002670325 Ffma
        temp_939 = fma(temp_288, temp_928, intBitsToFloat(temp_925));
        // 0x001838: 0x59A0228002670424 Ffma
        temp_940 = fma(temp_287, temp_928, intBitsToFloat(temp_933));
        // 0x001848: 0x59A00C0002670519 Ffma
        temp_941 = fma(temp_289, temp_928, intBitsToFloat(temp_936));
        // 0x001850: 0x5C5930000FF70418 Fadd
        temp_942 = 0.0 - temp_287;
        temp_943 = temp_942 + -0.0;
        // 0x001858: 0x5BE71C050FF72A30 Lop3
        temp_944 = ~temp_770;
        temp_945 = temp_944 & floatBitsToInt(temp_938);
        // 0x001868: 0x59A1148004771226 Ffma
        temp_946 = 0.0 - intBitsToFloat(temp_905);
        temp_947 = fma(temp_910, temp_946, temp_934);
        // 0x001870: 0x5BE7018B83A71845 Lop3
        temp_948 = temp_775 & floatBitsToInt(temp_288);
        temp_949 = ~temp_775;
        temp_950 = temp_949 & floatBitsToInt(temp_943);
        temp_951 = temp_948 | temp_950;
        // 0x001878: 0x5C5930000FF72829 Fadd
        temp_952 = 0.0 - temp_895;
        temp_953 = temp_952 + -0.0;
        // 0x001888: 0x59A0130004572826 Ffma
        temp_954 = fma(temp_895, intBitsToFloat(temp_951), temp_947);
        // 0x001890: 0x5C47000002973A29 Lop
        temp_955 = temp_775 & floatBitsToInt(temp_953);
        // 0x001898: 0x59A0180002670530 Ffma
        temp_956 = fma(temp_289, temp_954, intBitsToFloat(temp_945));
        // 0x0018A8: 0x5C68100001573030 Fmul
        temp_957 = temp_956 * temp_893;
        // 0x0018B0: 0x59A0180003371919 Ffma
        temp_958 = fma(temp_941, temp_894, temp_957);
        // 0x0018B8: 0x5BE7090B83872930 Lop3
        temp_959 = temp_770 & floatBitsToInt(temp_910);
        temp_960 = ~temp_770;
        temp_961 = temp_960 & temp_955;
        temp_962 = temp_959 | temp_961;
        // 0x0018C8: 0x5CB0100003170912 F2i
        temp_963 = roundEven(temp_875);
        temp_964 = max(temp_963, 0.0);
        temp_965 = uint(temp_964);
        temp_966 = clamp(temp_965, 0u, 0xFFFFu);
        // 0x0018D0: 0x5BE71D050FF72829 Lop3
        temp_967 = ~temp_775;
        temp_968 = temp_967 & floatBitsToInt(temp_895);
        // 0x0018D8: 0x59A0180002670330 Ffma
        temp_969 = fma(temp_288, temp_954, intBitsToFloat(temp_962));
        // 0x0018E8: 0x59A0148002670428 Ffma
        temp_970 = fma(temp_287, temp_954, intBitsToFloat(temp_968));
        // 0x0018F0: 0x5C68100002C71529 Fmul
        temp_971 = temp_893 * temp_866;
        // 0x0018F8: 0x5C68100001573030 Fmul
        temp_972 = temp_969 * temp_893;
        // 0x001908: 0x5C68100001572826 Fmul
        temp_973 = temp_970 * temp_893;
        // 0x001910: 0x5C68100002D71528 Fmul
        temp_974 = temp_893 * temp_867;
        // 0x001918: 0x59A0148003473334 Ffma
        temp_975 = fma(temp_894, temp_871, temp_971);
        // 0x001928: 0x5C98078001270022 Mov
        // 0x001930: 0x5C98078002170029 Mov
        // 0x001938: 0x59A018000337252C Ffma
        temp_976 = fma(temp_939, temp_894, temp_972);
        // 0x001948: 0x59A013000337242D Ffma
        temp_977 = fma(temp_940, temp_894, temp_973);
        // 0x001950: 0xDE380283B0C71024 Txd
        temp_978 = int(temp_966) & 0xFFFF;
        temp_979 = textureGrad(cTexture1, vec3(temp_843, temp_838, float(temp_978)), vec2(temp_839, temp_849), vec2(temp_841, temp_850)).xyz;
        temp_980 = temp_979.x;
        temp_981 = temp_979.y;
        temp_982 = temp_979.z;
        // 0x001958: 0x59A0140003573335 Ffma
        temp_983 = fma(temp_894, temp_872, temp_974);
        // 0x001968: 0x5C98078002070028 Mov
        // 0x001970: 0xDE380283B1C72020 Txd
        temp_984 = int(temp_966) & 0xFFFF;
        temp_985 = textureGrad(cTexture1, vec3(temp_846, temp_848, float(temp_984)), vec2(temp_844, temp_852), vec2(temp_845, temp_853)).xyz;
        temp_986 = temp_985.x;
        temp_987 = temp_985.y;
        temp_988 = temp_985.z;
        // 0x001978: 0xDE3A0263B0C71030 Txd
        temp_989 = int(temp_966) & 0xFFFF;
        temp_990 = textureGrad(cTexture0, vec3(temp_843, temp_838, float(temp_989)), vec2(temp_839, temp_849), vec2(temp_841, temp_850)).xyz;
        temp_991 = temp_990.x;
        temp_992 = temp_990.y;
        temp_993 = temp_990.z;
        // 0x001988: 0x5C9807800127002A Mov
        // 0x001990: 0xDE3A0263B1C72828 Txd
        temp_994 = int(temp_966) & 0xFFFF;
        temp_995 = textureGrad(cTexture0, vec3(temp_846, temp_848, float(temp_994)), vec2(temp_844, temp_852), vec2(temp_845, temp_853)).xyz;
        temp_996 = temp_995.x;
        temp_997 = temp_995.y;
        temp_998 = temp_995.z;
        // 0x001998: 0x5C68100002E7152E Fmul
        temp_999 = temp_893 * temp_868;
        // 0x0019A8: 0x5C68100001571A1A Fmul
        temp_1000 = temp_863 * temp_893;
        // 0x0019B0: 0x5C58100003371515 Fadd
        temp_1001 = temp_893 + temp_894;
        // 0x0019B8: 0x5C68100004474444 Fmul
        temp_1002 = temp_877 * temp_877;
        // 0x0019C8: 0x59A0170003673336 Ffma
        temp_1003 = fma(temp_894, temp_873, temp_999);
        // 0x0019D0: 0x59A00D0003371633 Ffma
        temp_1004 = fma(temp_858, temp_894, temp_1000);
        // 0x0019D8: 0x5BE7018B8397460F Lop3
        temp_1005 = temp_766 & floatBitsToInt(temp_288);
        temp_1006 = ~temp_766;
        temp_1007 = temp_1006 & floatBitsToInt(temp_891);
        temp_1008 = temp_1005 | temp_1007;
        // 0x0019E8: 0x5BE7018B80271812 Lop3
        temp_1009 = temp_769 & floatBitsToInt(temp_288);
        temp_1010 = ~temp_769;
        temp_1011 = temp_1010 & floatBitsToInt(temp_943);
        temp_1012 = temp_1009 | temp_1011;
        // 0x0019F0: 0xF0F0000034270000 Depbar
        // 0x0019F8: 0x32A215C000072424 Ffma
        temp_1013 = fma(temp_980, 2.0, -1.0);
        // 0x001A08: 0x32A215C000072525 Ffma
        temp_1014 = fma(temp_981, 2.0, -1.0);
        // 0x001A10: 0x32A215C00007200D Ffma
        temp_1015 = fma(temp_986, 2.0, -1.0);
        // 0x001A18: 0x49A013040067260E Ffma
        temp_1016 = fma(temp_982, fp_c1.data[1].z, temp_982);
        // 0x001A28: 0x32A215C00007212B Ffma
        temp_1017 = fma(temp_987, 2.0, -1.0);
        // 0x001A30: 0x5C6810000247242E Fmul
        temp_1018 = temp_1013 * temp_1013;
        // 0x001A38: 0x5C5930000FF72511 Fadd
        temp_1019 = 0.0 - temp_1014;
        temp_1020 = temp_1019 + -0.0;
        // 0x001A48: 0x5C5930000FF72416 Fadd
        temp_1021 = 0.0 - temp_1013;
        temp_1022 = temp_1021 + -0.0;
        // 0x001A50: 0x5C68100000D70D10 Fmul
        temp_1023 = temp_1015 * temp_1015;
        // 0x001A58: 0x59A017000257252E Ffma
        temp_1024 = fma(temp_1014, temp_1014, temp_1018);
        // 0x001A68: 0x59A0080002B72B10 Ffma
        temp_1025 = fma(temp_1017, temp_1017, temp_1023);
        // 0x001A70: 0x385D103F80072E2E Fadd
        temp_1026 = 0.0 - temp_1024;
        temp_1027 = temp_1026 + 1.0;
        temp_1028 = clamp(temp_1027, 0.0, 1.0);
        // 0x001A78: 0x5080000000872E2E Mufu
        temp_1029 = sqrt(temp_1028);
        // 0x001A88: 0x385D103F80071010 Fadd
        temp_1030 = 0.0 - temp_1025;
        temp_1031 = temp_1030 + 1.0;
        temp_1032 = clamp(temp_1031, 0.0, 1.0);
        // 0x001A90: 0x5080000000871010 Mufu
        temp_1033 = sqrt(temp_1032);
        // 0x001A98: 0x59A1170002470F0C Ffma
        temp_1034 = 0.0 - temp_1013;
        temp_1035 = fma(intBitsToFloat(temp_1008), temp_1034, temp_1029);
        // 0x001AA8: 0x0883D4CCCCD70E0F Fadd32i
        temp_1036 = temp_1016 + 0.0500000007;
        // 0x001AB0: 0x59A1080000D74710 Ffma
        temp_1037 = 0.0 - temp_1015;
        temp_1038 = fma(intBitsToFloat(temp_905), temp_1037, temp_1033);
        // 0x001AB8: 0x59A006000257120E Ffma
        temp_1039 = fma(intBitsToFloat(temp_1012), temp_1014, temp_1035);
        // 0x001AC8: 0x5C47000001170212 Lop
        temp_1040 = temp_769 & floatBitsToInt(temp_1020);
        // 0x001AD0: 0x5BE71C850FF7160C Lop3
        temp_1041 = ~temp_766;
        temp_1042 = temp_1041 & floatBitsToInt(temp_1022);
        // 0x001AD8: 0x5C68100004470F0F Fmul
        temp_1043 = temp_1036 * temp_1002;
        // 0x001AE8: 0x5BE701050FF72525 Lop3
        temp_1044 = ~temp_769;
        temp_1045 = temp_1044 & floatBitsToInt(temp_1014);
        // 0x001AF0: 0x5C68100001471411 Fmul
        temp_1046 = temp_881 * temp_881;
        // 0x001AF8: 0x5C5930000FF72B14 Fadd
        temp_1047 = 0.0 - temp_1017;
        temp_1048 = temp_1047 + -0.0;
        // 0x001B08: 0x5BE7120B83971224 Lop3
        temp_1049 = temp_766 & floatBitsToInt(temp_1013);
        temp_1050 = ~temp_766;
        temp_1051 = temp_1050 & temp_1040;
        temp_1052 = temp_1049 | temp_1051;
        // 0x001B10: 0x59A0060000E7050C Ffma
        temp_1053 = fma(temp_289, temp_1039, intBitsToFloat(temp_1042));
        // 0x001B18: 0x49A0110400672212 Ffma
        temp_1054 = fma(temp_988, fp_c1.data[1].z, temp_988);
        // 0x001B28: 0x59A0128000E70402 Ffma
        temp_1055 = fma(temp_287, temp_1039, intBitsToFloat(temp_1045));
        // 0x001B30: 0x5C58100001570F15 Fadd
        temp_1056 = temp_1043 + temp_1001;
        // 0x001B38: 0x59A0198000F72633 Ffma
        temp_1057 = fma(temp_982, temp_1043, temp_1004);
        // 0x001B48: 0x59A0120000E7030E Ffma
        temp_1058 = fma(temp_288, temp_1039, intBitsToFloat(temp_1052));
        // 0x001B50: 0x59A00C8000F70C19 Ffma
        temp_1059 = fma(temp_1053, temp_1043, temp_958);
        // 0x001B58: 0x0883D4CCCCD7120C Fadd32i
        temp_1060 = temp_1054 + 0.0500000007;
        // 0x001B68: 0x59A0168000F7022D Ffma
        temp_1061 = fma(temp_1055, temp_1043, temp_977);
        // 0x001B70: 0x5C5930000FF70D02 Fadd
        temp_1062 = 0.0 - temp_1015;
        temp_1063 = temp_1062 + -0.0;
        // 0x001B78: 0x59A0080002B74510 Ffma
        temp_1064 = fma(intBitsToFloat(temp_951), temp_1017, temp_1038);
        // 0x001B88: 0x59A0160000F70E2C Ffma
        temp_1065 = fma(temp_1058, temp_1043, temp_976);
        // 0x001B90: 0x5C47000001473A0E Lop
        temp_1066 = temp_775 & floatBitsToInt(temp_1048);
        // 0x001B98: 0x5C68100001170C0C Fmul
        temp_1067 = temp_1060 * temp_1046;
        // 0x001BA8: 0xF0F0000034170000 Depbar
        // 0x001BB0: 0x59A01A0003070F11 Ffma
        temp_1068 = fma(temp_1043, temp_991, temp_975);
        // 0x001BB8: 0x5BE71C050FF70202 Lop3
        temp_1069 = ~temp_770;
        temp_1070 = temp_1069 & floatBitsToInt(temp_1063);
        // 0x001BC8: 0x59A01A8003170F12 Ffma
        temp_1071 = fma(temp_1043, temp_992, temp_983);
        // 0x001BD0: 0x5BE71D050FF72B2B Lop3
        temp_1072 = ~temp_775;
        temp_1073 = temp_1072 & floatBitsToInt(temp_1017);
        // 0x001BD8: 0x5BE7068B83870E0E Lop3
        temp_1074 = temp_770 & floatBitsToInt(temp_1015);
        temp_1075 = ~temp_770;
        temp_1076 = temp_1075 & temp_1066;
        temp_1077 = temp_1074 | temp_1076;
        // 0x001BE8: 0x5C58100001570C15 Fadd
        temp_1078 = temp_1067 + temp_1056;
        // 0x001BF0: 0x59A01B0003270F0F Ffma
        temp_1079 = fma(temp_1043, temp_993, temp_1003);
        // 0x001BF8: 0x5080000000471520 Mufu
        temp_1080 = 1.0 / temp_1078;
        // 0x001C08: 0x59A0010001070502 Ffma
        temp_1081 = fma(temp_289, temp_1064, intBitsToFloat(temp_1070));
        // 0x001C10: 0x59A0198000C72233 Ffma
        temp_1082 = fma(temp_988, temp_1067, temp_1057);
        // 0x001C18: 0x59A0088002870C11 Ffma
        temp_1083 = fma(temp_1067, temp_996, temp_1068);
        // 0x001C28: 0x59A0090002970C12 Ffma
        temp_1084 = fma(temp_1067, temp_997, temp_1071);
        // 0x001C30: 0x59A015800107042B Ffma
        temp_1085 = fma(temp_287, temp_1064, intBitsToFloat(temp_1073));
        // 0x001C38: 0x59A007000107030E Ffma
        temp_1086 = fma(temp_288, temp_1064, intBitsToFloat(temp_1077));
        // 0x001C48: 0x59A0078002A70C2A Ffma
        temp_1087 = fma(temp_1067, temp_998, temp_1079);
        // 0x001C50: 0x59A00C8000C70216 Ffma
        temp_1088 = fma(temp_1081, temp_1067, temp_1059);
        // 0x001C58: 0x59A0168000C72B1A Ffma
        temp_1089 = fma(temp_1085, temp_1067, temp_1061);
        // 0x001C68: 0x59A0160000C70E02 Ffma
        temp_1090 = fma(temp_1086, temp_1067, temp_1065);
        // 0x001C70: 0x5C68100002073325 Fmul
        temp_1091 = temp_1082 * temp_1080;
        // 0x001C78: 0x5C68100002071121 Fmul
        temp_1092 = temp_1083 * temp_1080;
        // 0x001C88: 0x5C6810000207120F Fmul
        temp_1093 = temp_1084 * temp_1080;
        // 0x001C90: 0x5C68100002072A20 Fmul
        temp_1094 = temp_1087 * temp_1080;
        // 0x001C98: 0xF0F800000007000F Sync
        temp_729 = temp_1088;
        temp_730 = temp_1089;
        temp_731 = temp_1090;
        temp_732 = temp_1091;
        temp_733 = temp_1092;
        temp_734 = temp_1093;
        temp_735 = temp_1094;
    }
    temp_736 = false;
    temp_1095 = temp_729;
    temp_1096 = temp_730;
    temp_1097 = temp_731;
    temp_1098 = temp_732;
    temp_1099 = temp_733;
    temp_1100 = temp_734;
    temp_1101 = temp_735;
    // 0x001CA8: 0x48840B900E87400C Fset
    temp_1102 = 0.0 - temp_39;
    temp_1103 = temp_1102 > gsys_context.data[58].x;
    // 0x001CB0: 0x5C68100001671603 Fmul
    temp_1104 = temp_1095 * temp_1095;
    // 0x001CB8: 0x5CE2000000C73A0C I2i
    temp_1105 = abs((temp_1103 ? -1 : 0));
    // 0x001CC8: 0x48840B900E974004 Fset
    temp_1106 = 0.0 - temp_39;
    temp_1107 = temp_1106 > gsys_context.data[58].y;
    // 0x001CD0: 0x4C9807A40D170031 Mov
    // 0x001CD8: 0x5CE2000000473A36 I2i
    temp_1108 = abs((temp_1107 ? -1 : 0));
    // 0x001CE8: 0x48840B900EA74005 Fset
    temp_1109 = 0.0 - temp_39;
    temp_1110 = temp_1109 > gsys_context.data[58].z;
    // 0x001CF0: 0x5CE2000003173A38 I2i
    temp_1111 = abs(floatBitsToInt(gsys_environment.data[52].y));
    // 0x001CF8: 0x4C9807A40D07000E Mov
    // 0x001D08: 0x5CE0800003173AFF I2i
    temp_1112 = floatBitsToInt(gsys_environment.data[52].y) == 0;
    temp_1113 = floatBitsToInt(gsys_environment.data[52].y) < 0;
    // 0x001D10: 0x59A0018001A71A03 Ffma
    temp_1114 = fma(temp_1096, temp_1096, temp_1104);
    // 0x001D18: 0x5CE2000000573A05 I2i
    temp_1115 = abs((temp_1110 ? -1 : 0));
    // 0x001D28: 0x5C59100001B73C1B Fadd
    temp_1116 = 0.0 - temp_195;
    temp_1117 = temp_1116 + temp_194;
    // 0x001D30: 0x5CB8000000E70A11 I2f
    temp_1118 = float(floatBitsToUint(gsys_environment.data[52].x));
    // 0x001D38: 0x4C9807B400B7002C Mov
    // 0x001D48: 0x0103F0000007F029 Mov32i
    // 0x001D50: 0x5CB8000003870A0D I2f
    temp_1119 = float(uint(temp_1111));
    // 0x001D58: 0x59A0018000270204 Ffma
    temp_1120 = fma(temp_1097, temp_1097, temp_1114);
    // 0x001D68: 0x5080000000471103 Mufu
    temp_1121 = 1.0 / temp_1118;
    // 0x001D70: 0x5CC01B0000C70536 Iadd3
    temp_1122 = temp_1115 + temp_1105;
    temp_1123 = temp_1122 + temp_1108;
    // 0x001D78: 0x5080000000570404 Mufu
    temp_1124 = inversesqrt(temp_1120);
    // 0x001D88: 0x4C68102401072C28 Fmul
    temp_1125 = gsys_scene_material.data[2].w * gsys_environment.data[4].x;
    // 0x001D90: 0x5CB8000003672A12 I2f
    temp_1126 = float(temp_1123);
    // 0x001D98: 0x4C68102401272C30 Fmul
    temp_1127 = gsys_scene_material.data[2].w * gsys_environment.data[4].z;
    // 0x001DA8: 0x5080000000470D0D Mufu
    temp_1128 = 1.0 / temp_1119;
    // 0x001DB0: 0x50A0038000070D07 Csetp
    temp_1129 = !temp_1112;
    temp_1130 = temp_1113 || temp_1129;
    // 0x001DB8: 0x5CE0800000E70AFF I2i
    temp_1131 = floatBitsToInt(gsys_environment.data[52].x) == 0;
    temp_1132 = floatBitsToInt(gsys_environment.data[52].x) < 0;
    // 0x001DC8: 0x1C0FFFFFFFE70303 Iadd32i
    temp_1133 = floatBitsToInt(temp_1121) + -2;
    // 0x001DD0: 0x5CB0118001271A12 F2i
    temp_1134 = trunc(temp_1126);
    temp_1135 = int(temp_1134);
    // 0x001DD8: 0x5C68100001670416 Fmul
    temp_1136 = temp_1124 * temp_1095;
    // 0x001DE8: 0x5C68100001A7041A Fmul
    temp_1137 = temp_1124 * temp_1096;
    // 0x001DF0: 0x5C68100000270422 Fmul
    temp_1138 = temp_1124 * temp_1097;
    // 0x001DF8: 0x3848000000673636 Shl
    temp_1139 = temp_1123 << 6;
    // 0x001E08: 0x1C0FFFFFFFE70D02 Iadd32i
    temp_1140 = floatBitsToInt(temp_1128) + -2;
    // 0x001E10: 0x5CE2000001273A14 I2i
    temp_1141 = abs(temp_1135);
    // 0x001E18: 0x4C6810100007160C Fmul
    temp_1142 = temp_1136 * gsys_context.data[0].x;
    // 0x001E28: 0x5CB8018001270A05 I2f
    temp_1143 = float(uint(temp_1135));
    // 0x001E30: 0x4C68101000471604 Fmul
    temp_1144 = temp_1136 * gsys_context.data[1].x;
    // 0x001E38: 0x50A0038000070D0F Csetp
    temp_1145 = !temp_1131;
    temp_1146 = temp_1132 || temp_1145;
    // 0x001E48: 0x49A0061000171A0C Ffma
    temp_1147 = fma(temp_1137, gsys_context.data[0].y, temp_1142);
    // 0x001E50: 0x5CB8018001470A10 I2f
    temp_1148 = float(uint(temp_1141));
    // 0x001E58: 0x5C68118000570333 Fmul
    temp_1149 = intBitsToFloat(temp_1133) * temp_1143;
    // 0x001E68: 0x4C68101000871605 Fmul
    temp_1150 = temp_1136 * gsys_context.data[2].x;
    // 0x001E70: 0x5CB0118003370A33 F2i
    temp_1151 = trunc(temp_1149);
    temp_1152 = max(temp_1151, 0.0);
    temp_1153 = uint(temp_1152);
    // 0x001E78: 0x4C9807A40E570016 Mov
    // 0x001E88: 0x49A0021000571A04 Ffma
    temp_1154 = fma(temp_1137, gsys_context.data[1].y, temp_1144);
    // 0x001E90: 0x49A0061000272226 Ffma
    temp_1155 = fma(temp_1138, gsys_context.data[0].z, temp_1147);
    // 0x001E98: 0x49A0029000971A05 Ffma
    temp_1156 = fma(temp_1137, gsys_context.data[2].y, temp_1150);
    // 0x001EA8: 0x4C68101000171615 Fmul
    temp_1157 = gsys_environment.data[57].y * gsys_context.data[0].y;
    // 0x001EB0: 0x4C6810100057160D Fmul
    temp_1158 = gsys_environment.data[57].y * gsys_context.data[1].y;
    // 0x001EB8: 0x49A0021000672224 Ffma
    temp_1159 = fma(temp_1138, gsys_context.data[1].z, temp_1154);
    // 0x001EC8: 0x5C68118001070210 Fmul
    temp_1160 = intBitsToFloat(temp_1140) * temp_1148;
    // 0x001ED0: 0x4C68101000971604 Fmul
    temp_1161 = gsys_environment.data[57].y * gsys_context.data[2].y;
    // 0x001ED8: 0x5CB0118001070A2E F2i
    temp_1162 = trunc(temp_1160);
    temp_1163 = max(temp_1162, 0.0);
    temp_1164 = uint(temp_1163);
    // 0x001EE8: 0x5B007F8003370E11 Xmad
    temp_1165 = floatBitsToInt(gsys_environment.data[52].x) & 0xFFFF;
    temp_1166 = int(temp_1153) & 0xFFFF;
    temp_1167 = temp_1165 * temp_1166;
    // 0x001EF0: 0x5B007FA803370E0C Xmad
    temp_1168 = floatBitsToInt(gsys_environment.data[52].x) & 0xFFFF;
    temp_1169 = temp_1153 >> 16;
    temp_1170 = temp_1168 * int(temp_1169);
    temp_1171 = temp_1170 & 0xFFFF;
    temp_1172 = int(temp_1153) << 16;
    temp_1173 = temp_1171 | temp_1172;
    // 0x001EF8: 0x49A00AA40E472615 Ffma
    temp_1174 = fma(temp_1155, gsys_environment.data[57].x, temp_1157);
    // 0x001F08: 0x49A0029000A72222 Ffma
    temp_1175 = fma(temp_1138, gsys_context.data[2].z, temp_1156);
    // 0x001F10: 0x49A006A40E47240D Ffma
    temp_1176 = fma(temp_1159, gsys_environment.data[57].x, temp_1158);
    // 0x001F18: 0x4C9807A406870016 Mov
    // 0x001F28: 0x5B30089800C70E11 Xmad
    temp_1177 = floatBitsToUint(gsys_environment.data[52].x) >> 16;
    temp_1178 = uint(temp_1173) >> 16;
    temp_1179 = int(temp_1177) * int(temp_1178);
    temp_1180 = temp_1179 << 16;
    temp_1181 = temp_1173 << 16;
    temp_1182 = temp_1167 + temp_1181;
    temp_1183 = temp_1180 + temp_1182;
    // 0x001F30: 0x5C6810000157150C Fmul
    temp_1184 = temp_1174 * temp_1174;
    // 0x001F38: 0x49A002240E472204 Ffma
    temp_1185 = fma(temp_1175, gsys_environment.data[57].x, temp_1161);
    // 0x001F48: 0x0103D9816267F010 Mov32i
    // 0x001F50: 0x51A60B2406971316 Ffma
    temp_1186 = 0.0 - gsys_environment.data[26].y;
    temp_1187 = fma(temp_500, gsys_environment.data[26].x, temp_1186);
    temp_1188 = clamp(temp_1187, 0.0, 1.0);
    // 0x001F58: 0x5B007F8002E73819 Xmad
    temp_1189 = temp_1111 & 0xFFFF;
    temp_1190 = int(temp_1164) & 0xFFFF;
    temp_1191 = temp_1189 * temp_1190;
    // 0x001F68: 0x5B007FA802E7381A Xmad
    temp_1192 = temp_1111 & 0xFFFF;
    temp_1193 = temp_1164 >> 16;
    temp_1194 = temp_1192 * int(temp_1193);
    temp_1195 = temp_1194 & 0xFFFF;
    temp_1196 = int(temp_1164) << 16;
    temp_1197 = temp_1195 | temp_1196;
    // 0x001F70: 0x59A0060000D70D05 Ffma
    temp_1198 = fma(temp_1176, temp_1176, temp_1184);
    // 0x001F78: 0x5C1100000117120C Iadd
    temp_1199 = 0 - temp_1183;
    temp_1200 = temp_1135 + temp_1199;
    // 0x001F88: 0x5CB8018000C70A0C I2f
    temp_1201 = float(uint(temp_1200));
    // 0x001F90: 0x3859103F80071616 Fadd
    temp_1202 = 0.0 - temp_1188;
    temp_1203 = temp_1202 + 1.0;
    // 0x001F98: 0x5B300C9801A73811 Xmad
    temp_1204 = uint(temp_1111) >> 16;
    temp_1205 = uint(temp_1197) >> 16;
    temp_1206 = int(temp_1204) * int(temp_1205);
    temp_1207 = temp_1206 << 16;
    temp_1208 = temp_1197 << 16;
    temp_1209 = temp_1191 + temp_1208;
    temp_1210 = temp_1207 + temp_1209;
    // 0x001FA8: 0x59A0028000470405 Ffma
    temp_1211 = fma(temp_1185, temp_1185, temp_1198);
    // 0x001FB0: 0x508000000057051A Mufu
    temp_1212 = inversesqrt(temp_1211);
    // 0x001FB8: 0x59A01E0001B7161B Ffma
    temp_1213 = fma(temp_1203, temp_1117, temp_195);
    // 0x001FC8: 0x5C11000001171411 Iadd
    temp_1214 = 0 - temp_1210;
    temp_1215 = temp_1141 + temp_1214;
    // 0x001FD0: 0x5CB8018001170A11 I2f
    temp_1216 = float(uint(temp_1215));
    // 0x001FD8: 0x5C68118000C70303 Fmul
    temp_1217 = intBitsToFloat(temp_1133) * temp_1201;
    // 0x001FE8: 0x4C61178401071B0C Fmnmx
    temp_1218 = 0.0 - temp_1213;
    temp_1219 = max(temp_1218, fp_c1.data[4].x);
    // 0x001FF0: 0x5CB0118000370A1C F2i
    temp_1220 = trunc(temp_1217);
    temp_1221 = max(temp_1220, 0.0);
    temp_1222 = uint(temp_1221);
    // 0x001FF8: 0x4C68102401172C1B Fmul
    temp_1223 = gsys_scene_material.data[2].w * gsys_environment.data[4].y;
    // 0x002008: 0x5C68100002673B05 Fmul
    temp_1224 = temp_62 * temp_1155;
    // 0x002010: 0x5C68100001A71515 Fmul
    temp_1225 = temp_1174 * temp_1212;
    // 0x002018: 0x5C68100001A70D18 Fmul
    temp_1226 = temp_1176 * temp_1212;
    // 0x002028: 0x5C68100001A70439 Fmul
    temp_1227 = temp_1185 * temp_1212;
    // 0x002030: 0x32A014BF00070C0D Ffma
    temp_1228 = fma(temp_1219, 0.5, 0.5);
    // 0x002038: 0x4C68101009473E04 Fmul
    temp_1229 = temp_61 * gsys_context.data[37].x;
    // 0x002048: 0x5C68118001170219 Fmul
    temp_1230 = intBitsToFloat(temp_1140) * temp_1216;
    // 0x002050: 0x5C68100001572802 Fmul
    temp_1231 = temp_1125 * temp_1225;
    // 0x002058: 0x5CB0118001970A19 F2i
    temp_1232 = trunc(temp_1230);
    temp_1233 = max(temp_1232, 0.0);
    temp_1234 = uint(temp_1233);
    // 0x002068: 0x59A0028002473705 Ffma
    temp_1235 = fma(temp_63, temp_1159, temp_1224);
    // 0x002070: 0x49A0080401170D10 Ffma
    temp_1236 = fma(temp_1228, fp_c1.data[4].y, 0.0742609948);
    // 0x002078: 0x3859103F80070D11 Fadd
    temp_1237 = 0.0 - temp_1228;
    temp_1238 = temp_1237 + 1.0;
    // 0x002088: 0x49A0021009573D04 Ffma
    temp_1239 = fma(temp_451, gsys_context.data[37].y, temp_1229);
    // 0x002090: 0x5080000000871111 Mufu
    temp_1240 = sqrt(temp_1238);
    // 0x002098: 0x59A0010001871B02 Ffma
    temp_1241 = fma(temp_1223, temp_1226, temp_1231);
    // 0x0020A8: 0x59A0028002272F2D Ffma
    temp_1242 = fma(temp_64, temp_1175, temp_1235);
    // 0x0020B0: 0x51A0080401270D10 Ffma
    temp_1243 = fma(temp_1228, temp_1236, fp_c1.data[4].z);
    // 0x0020B8: 0x4C68101008C73E0C Fmul
    temp_1244 = temp_61 * gsys_context.data[35].x;
    // 0x0020C8: 0x5C10000001C73333 Iadd
    temp_1245 = int(temp_1153) + int(temp_1222);
    // 0x0020D0: 0x49A0021009673F1A Ffma
    temp_1246 = fma(temp_83, gsys_context.data[37].z, temp_1239);
    // 0x0020D8: 0x59A001000397301E Ffma
    temp_1247 = fma(temp_1127, temp_1227, temp_1241);
    // 0x0020E8: 0x5C68100002D72604 Fmul
    temp_1248 = temp_1155 * temp_1242;
    // 0x0020F0: 0x51A0080401370D10 Ffma
    temp_1249 = fma(temp_1228, temp_1243, fp_c1.data[4].w);
    // 0x0020F8: 0x5C10000001972E2E Iadd
    temp_1250 = int(temp_1164) + int(temp_1234);
    // 0x002108: 0x5C68100002D72405 Fmul
    temp_1251 = temp_1159 * temp_1242;
    // 0x002110: 0x49A0061008D73D0C Ffma
    temp_1252 = fma(temp_451, gsys_context.data[35].y, temp_1244);
    // 0x002118: 0x3859503F80071E02 Fadd
    temp_1253 = abs(temp_1247);
    temp_1254 = 0.0 - temp_1253;
    temp_1255 = temp_1254 + 1.0;
    // 0x002128: 0x33A01DC000070404 Ffma
    temp_1256 = fma(temp_1248, -2.0, temp_62);
    // 0x002130: 0x5080400000370202 Mufu
    temp_1257 = abs(temp_1255);
    temp_1258 = log2(temp_1257);
    // 0x002138: 0x5C6910000117102B Fmul
    temp_1259 = 0.0 - temp_1240;
    temp_1260 = temp_1249 * temp_1259;
    // 0x002148: 0xEF9500402C073610 Ldc
    temp_1261 = temp_1139 + 0x2C0;
    temp_1262 = uint(temp_1261) >> 2;
    temp_1263 = temp_1262 >> 2;
    temp_1264 = int(temp_1262) & 3;
    temp_1265 = gsys_context.data[int(temp_1263)][temp_1264];
    temp_1266 = int(temp_1262) + 1;
    temp_1267 = uint(temp_1266) >> 2;
    temp_1268 = temp_1266 & 3;
    temp_1269 = gsys_context.data[int(temp_1267)][temp_1268];
    // 0x002150: 0x33A01BC000070505 Ffma
    temp_1270 = fma(temp_1251, -2.0, temp_63);
    // 0x002158: 0x5B007F8002E7381D Xmad
    temp_1271 = temp_1111 & 0xFFFF;
    temp_1272 = temp_1250 & 0xFFFF;
    temp_1273 = temp_1271 * temp_1272;
    // 0x002168: 0x5B007FA802E73803 Xmad
    temp_1274 = temp_1111 & 0xFFFF;
    temp_1275 = uint(temp_1250) >> 16;
    temp_1276 = temp_1274 * int(temp_1275);
    temp_1277 = temp_1276 & 0xFFFF;
    temp_1278 = temp_1250 << 16;
    temp_1279 = temp_1277 | temp_1278;
    // 0x002170: 0x49A0061008E73F2A Ffma
    temp_1280 = fma(temp_83, gsys_context.data[35].z, temp_1252);
    // 0x002178: 0xEF9500402D07360C Ldc
    temp_1281 = temp_1139 + 0x2D0;
    temp_1282 = uint(temp_1281) >> 2;
    temp_1283 = temp_1282 >> 2;
    temp_1284 = int(temp_1282) & 3;
    temp_1285 = gsys_context.data[int(temp_1283)][temp_1284];
    temp_1286 = int(temp_1282) + 1;
    temp_1287 = uint(temp_1286) >> 2;
    temp_1288 = temp_1286 & 3;
    temp_1289 = gsys_context.data[int(temp_1287)][temp_1288];
    // 0x002188: 0x4C68101003470434 Fmul
    temp_1290 = temp_1256 * gsys_context.data[13].x;
    // 0x002190: 0x4C68101003070432 Fmul
    temp_1291 = temp_1256 * gsys_context.data[12].x;
    // 0x002198: 0x59A10A8001E72845 Ffma
    temp_1292 = 0.0 - temp_1247;
    temp_1293 = fma(temp_1125, temp_1292, temp_1225);
    // 0x0021A8: 0x5B300E980037381D Xmad
    temp_1294 = uint(temp_1111) >> 16;
    temp_1295 = uint(temp_1279) >> 16;
    temp_1296 = int(temp_1294) * int(temp_1295);
    temp_1297 = temp_1296 << 16;
    temp_1298 = temp_1279 << 16;
    temp_1299 = temp_1273 + temp_1298;
    temp_1300 = temp_1297 + temp_1299;
    // 0x0021B0: 0x4C6910240CD7401C Fmul
    temp_1301 = 0.0 - gsys_environment.data[51].y;
    temp_1302 = temp_39 * temp_1301;
    // 0x0021B8: 0x59A10C0001E71B3A Ffma
    temp_1303 = 0.0 - temp_1247;
    temp_1304 = fma(temp_1223, temp_1303, temp_1226);
    // 0x0021C8: 0x4C6810240E770202 Fmul
    temp_1305 = temp_1258 * gsys_environment.data[57].w;
    // 0x0021D0: 0x49A01A1003570534 Ffma
    temp_1306 = fma(temp_1270, gsys_context.data[13].y, temp_1290);
    // 0x0021D8: 0x49A0191003170532 Ffma
    temp_1307 = fma(temp_1270, gsys_context.data[12].y, temp_1291);
    // 0x0021E8: 0x5C11000001D7141D Iadd
    temp_1308 = 0 - temp_1300;
    temp_1309 = temp_1141 + temp_1308;
    // 0x0021F0: 0xEF9500402D873614 Ldc
    temp_1310 = temp_1139 + 0x2D8;
    temp_1311 = uint(temp_1310) >> 2;
    temp_1312 = temp_1311 >> 2;
    temp_1313 = int(temp_1311) & 3;
    temp_1314 = gsys_context.data[int(temp_1312)][temp_1313];
    temp_1315 = int(temp_1311) + 1;
    temp_1316 = uint(temp_1315) >> 2;
    temp_1317 = temp_1315 & 3;
    temp_1318 = gsys_context.data[int(temp_1316)][temp_1317];
    // 0x0021F8: 0x4C68101009073E3E Fmul
    temp_1319 = temp_61 * gsys_context.data[36].x;
    // 0x002208: 0x59A11C8001E73039 Ffma
    temp_1320 = 0.0 - temp_1247;
    temp_1321 = fma(temp_1127, temp_1320, temp_1227);
    // 0x002210: 0xEF9500402B87361E Ldc
    temp_1322 = temp_1139 + 0x2B8;
    temp_1323 = uint(temp_1322) >> 2;
    temp_1324 = temp_1323 >> 2;
    temp_1325 = int(temp_1323) & 3;
    temp_1326 = gsys_context.data[int(temp_1324)][temp_1325];
    temp_1327 = int(temp_1323) + 1;
    temp_1328 = uint(temp_1327) >> 2;
    temp_1329 = temp_1327 & 3;
    temp_1330 = gsys_context.data[int(temp_1328)][temp_1329];
    // 0x002218: 0x5C68100002D7223C Fmul
    temp_1331 = temp_1175 * temp_1242;
    // 0x002228: 0x5C90008000270019 Rro
    // 0x002230: 0x4C68101002C70402 Fmul
    temp_1332 = temp_1256 * gsys_context.data[11].x;
    // 0x002238: 0x5080000000271919 Mufu
    temp_1333 = exp2(temp_1305);
    // 0x002248: 0x49A01F1009173D3E Ffma
    temp_1334 = fma(temp_451, gsys_context.data[36].y, temp_1319);
    // 0x002250: 0x5B5C038003871D38 Iset
    temp_1335 = uint(temp_1309) >= uint(temp_1111);
    // 0x002258: 0x5B007F8003370E44 Xmad
    temp_1336 = floatBitsToInt(gsys_environment.data[52].x) & 0xFFFF;
    temp_1337 = temp_1245 & 0xFFFF;
    temp_1338 = temp_1336 * temp_1337;
    // 0x002268: 0x5B007FA803370E1D Xmad
    temp_1339 = floatBitsToInt(gsys_environment.data[52].x) & 0xFFFF;
    temp_1340 = uint(temp_1245) >> 16;
    temp_1341 = temp_1339 * int(temp_1340);
    temp_1342 = temp_1341 & 0xFFFF;
    temp_1343 = temp_1245 << 16;
    temp_1344 = temp_1342 | temp_1343;
    // 0x002270: 0x4C58101009771A1A Fadd
    temp_1345 = temp_1246 + gsys_context.data[37].w;
    // 0x002278: 0x49A0011002D70535 Ffma
    temp_1346 = fma(temp_1270, gsys_context.data[11].y, temp_1332);
    // 0x002288: 0x5080000000471A1A Mufu
    temp_1347 = 1.0 / temp_1345;
    // 0x002290: 0x5C11000003872E38 Iadd
    temp_1348 = 0 - (temp_1335 ? -1 : 0);
    temp_1349 = temp_1250 + temp_1348;
    // 0x002298: 0xEF9500402B073602 Ldc
    temp_1350 = temp_1139 + 0x2B0;
    temp_1351 = uint(temp_1350) >> 2;
    temp_1352 = temp_1351 >> 2;
    temp_1353 = int(temp_1351) & 3;
    temp_1354 = gsys_context.data[int(temp_1352)][temp_1353];
    temp_1355 = int(temp_1351) + 1;
    temp_1356 = uint(temp_1355) >> 2;
    temp_1357 = temp_1355 & 3;
    temp_1358 = gsys_context.data[int(temp_1356)][temp_1357];
    // 0x0022A8: 0x0103F8000007F02E Mov32i
    // 0x0022B0: 0xEF9500402A073604 Ldc
    temp_1359 = temp_1139 + 0x2A0;
    temp_1360 = uint(temp_1359) >> 2;
    temp_1361 = temp_1360 >> 2;
    temp_1362 = int(temp_1360) & 3;
    temp_1363 = gsys_context.data[int(temp_1361)][temp_1362];
    temp_1364 = int(temp_1360) + 1;
    temp_1365 = uint(temp_1364) >> 2;
    temp_1366 = temp_1364 & 3;
    temp_1367 = gsys_context.data[int(temp_1365)][temp_1366];
    // 0x0022B8: 0x49A01F1009273F3F Ffma
    temp_1368 = fma(temp_83, gsys_context.data[36].z, temp_1334);
    // 0x0022C8: 0x33A017C000073C3E Ffma
    temp_1369 = fma(temp_1331, -2.0, temp_64);
    // 0x0022D0: 0x5B30221801D70E44 Xmad
    temp_1370 = floatBitsToUint(gsys_environment.data[52].x) >> 16;
    temp_1371 = uint(temp_1344) >> 16;
    temp_1372 = int(temp_1370) * int(temp_1371);
    temp_1373 = temp_1372 << 16;
    temp_1374 = temp_1344 << 16;
    temp_1375 = temp_1338 + temp_1374;
    temp_1376 = temp_1373 + temp_1375;
    // 0x0022D8: 0x59A00C8001C7191C Ffma
    temp_1377 = fma(temp_1333, temp_1302, temp_1333);
    // 0x0022E8: 0xEF9500402C873618 Ldc
    temp_1378 = temp_1139 + 0x2C8;
    temp_1379 = uint(temp_1378) >> 2;
    temp_1380 = temp_1379 >> 2;
    temp_1381 = int(temp_1379) & 3;
    temp_1382 = gsys_context.data[int(temp_1380)][temp_1381];
    temp_1383 = int(temp_1379) + 1;
    temp_1384 = uint(temp_1383) >> 2;
    temp_1385 = temp_1383 & 3;
    temp_1386 = gsys_context.data[int(temp_1384)][temp_1385];
    // 0x0022F0: 0x4C58101009373F3F Fadd
    temp_1387 = temp_1368 + gsys_context.data[36].w;
    // 0x0022F8: 0x49A01A9002E73E35 Ffma
    temp_1388 = fma(temp_1369, gsys_context.data[11].z, temp_1346);
    // 0x002308: 0x49A0191003273E32 Ffma
    temp_1389 = fma(temp_1369, gsys_context.data[12].z, temp_1307);
    // 0x002310: 0x4C6810240CC71C47 Fmul
    temp_1390 = temp_1377 * gsys_environment.data[51].x;
    // 0x002318: 0x5C11000004471244 Iadd
    temp_1391 = 0 - temp_1376;
    temp_1392 = temp_1135 + temp_1391;
    // 0x002328: 0xEF9500402A87361C Ldc
    temp_1393 = temp_1139 + 0x2A8;
    temp_1394 = uint(temp_1393) >> 2;
    temp_1395 = temp_1394 >> 2;
    temp_1396 = int(temp_1394) & 3;
    temp_1397 = gsys_context.data[int(temp_1395)][temp_1396];
    temp_1398 = int(temp_1394) + 1;
    temp_1399 = uint(temp_1398) >> 2;
    temp_1400 = temp_1398 & 3;
    temp_1401 = gsys_context.data[int(temp_1399)][temp_1400];
    // 0x002330: 0x59A0210004774545 Ffma
    temp_1402 = fma(temp_1293, temp_1390, temp_37);
    // 0x002338: 0x59A0208004773A3A Ffma
    temp_1403 = fma(temp_1304, temp_1390, temp_38);
    // 0x002348: 0x59A0200004773939 Ffma
    temp_1404 = fma(temp_1321, temp_1390, temp_39);
    // 0x002350: 0x5B5C038000E74444 Iset
    temp_1405 = uint(temp_1392) >= floatBitsToUint(gsys_environment.data[52].x);
    // 0x002358: 0x4C9807B403B70042 Mov
    // 0x002368: 0x5C47040003171241 Lop
    temp_1406 = temp_1135 ^ floatBitsToInt(gsys_environment.data[52].y);
    // 0x002370: 0x5080000000371631 Mufu
    temp_1407 = log2(temp_1203);
    // 0x002378: 0x5C6810000107453C Fmul
    temp_1408 = temp_1402 * temp_1265;
    // 0x002388: 0x49A01A1003673E10 Ffma
    temp_1409 = fma(temp_1369, gsys_context.data[13].z, temp_1306);
    // 0x002390: 0x5C12000004473333 Iadd
    temp_1410 = 0 - temp_1245;
    temp_1411 = temp_1410 + (temp_1405 ? -1 : 0);
    // 0x002398: 0x3828000001F74141 Shr
    temp_1412 = uint(temp_1406) >> 31;
    // 0x0023A8: 0x59A01E0001173A3E Ffma
    temp_1413 = fma(temp_1403, temp_1269, temp_1408);
    // 0x0023B0: 0x5C68100000C7453C Fmul
    temp_1414 = temp_1402 * temp_1285;
    // 0x0023B8: 0x49A6148400774011 Ffma
    temp_1415 = fma(temp_39, fp_c1.data[1].w, -0.5);
    temp_1416 = clamp(temp_1415, 0.0, 1.0);
    // 0x0023C8: 0x1E2BBA3D70A74040 Fmul32i
    temp_1417 = temp_39 * -0.00499999989;
    // 0x0023D0: 0x5C1200000FF74141 Iadd
    temp_1418 = 0 - int(temp_1412);
    // 0x0023D8: 0x5C47040004173838 Lop
    temp_1419 = temp_1349 ^ temp_1418;
    // 0x0023E8: 0x5C6810000027450C Fmul
    temp_1420 = temp_1402 * temp_1354;
    // 0x0023F0: 0x59A01E0000D73A02 Ffma
    temp_1421 = fma(temp_1403, temp_1289, temp_1414);
    // 0x0023F8: 0x5C68100000474534 Fmul
    temp_1422 = temp_1402 * temp_1363;
    // 0x002408: 0x51A1213403B71104 Ffma
    temp_1423 = 0.0 - gsys_scene_material.data[14].w;
    temp_1424 = fma(temp_1416, temp_1423, gsys_scene_material.data[14].w);
    // 0x002410: 0x4C9807A40E27000D Mov
    // 0x002418: 0x59A01F0001873918 Ffma
    temp_1425 = fma(temp_1404, temp_1382, temp_1413);
    // 0x002428: 0x59A0060000373A03 Ffma
    temp_1426 = fma(temp_1403, temp_1358, temp_1420);
    // 0x002430: 0x59A0010001473902 Ffma
    temp_1427 = fma(temp_1404, temp_1314, temp_1421);
    // 0x002438: 0x59A01A0000573A3A Ffma
    temp_1428 = fma(temp_1403, temp_1367, temp_1422);
    // 0x002448: 0x5B007F8003370E05 Xmad
    temp_1429 = floatBitsToInt(gsys_environment.data[52].x) & 0xFFFF;
    temp_1430 = temp_1411 & 0xFFFF;
    temp_1431 = temp_1429 * temp_1430;
    // 0x002450: 0x5B007FA803370E33 Xmad
    temp_1432 = floatBitsToInt(gsys_environment.data[52].x) & 0xFFFF;
    temp_1433 = uint(temp_1411) >> 16;
    temp_1434 = temp_1432 * int(temp_1433);
    temp_1435 = temp_1434 & 0xFFFF;
    temp_1436 = temp_1411 << 16;
    temp_1437 = temp_1435 | temp_1436;
    // 0x002458: 0x32A0173FC0070404 Ffma
    temp_1438 = fma(temp_1424, 1.5, 1.0);
    // 0x002468: 0x5C58100001871918 Fadd
    temp_1439 = temp_1386 + temp_1425;
    // 0x002470: 0x5C58100000271511 Fadd
    temp_1440 = temp_1318 + temp_1427;
    // 0x002478: 0x59A0018001E7391E Ffma
    temp_1441 = fma(temp_1404, temp_1326, temp_1426);
    // 0x002488: 0x5080000000471111 Mufu
    temp_1442 = 1.0 / temp_1440;
    // 0x002490: 0x5B30029803370E05 Xmad
    temp_1443 = floatBitsToUint(gsys_environment.data[52].x) >> 16;
    temp_1444 = uint(temp_1437) >> 16;
    temp_1445 = int(temp_1443) * int(temp_1444);
    temp_1446 = temp_1445 << 16;
    temp_1447 = temp_1437 << 16;
    temp_1448 = temp_1431 + temp_1447;
    temp_1449 = temp_1446 + temp_1448;
    // 0x002498: 0x51A006A40CE7040E Ffma
    temp_1450 = fma(temp_1438, gsys_environment.data[56].z, gsys_environment.data[51].z);
    // 0x0024A8: 0x4C6810100307260D Fmul
    temp_1451 = temp_1155 * gsys_context.data[12].x;
    // 0x0024B0: 0x5C12000003874102 Iadd
    temp_1452 = 0 - temp_1418;
    temp_1453 = temp_1452 + temp_1419;
    // 0x0024B8: 0x4C68102406D7310C Fmul
    temp_1454 = temp_1407 * gsys_environment.data[27].y;
    // 0x0024C8: 0x59A01D0001C73914 Ffma
    temp_1455 = fma(temp_1404, temp_1397, temp_1428);
    // 0x0024D0: 0x5C10000000571203 Iadd
    temp_1456 = temp_1135 + temp_1449;
    // 0x0024D8: 0x4C68101003472605 Fmul
    temp_1457 = temp_1155 * gsys_context.data[13].x;
    // 0x0024E8: 0x49A006900317240D Ffma
    temp_1458 = fma(temp_1159, gsys_context.data[12].y, temp_1451);
    // 0x0024F0: 0x5C58100001E71F1F Fadd
    temp_1459 = temp_1330 + temp_1441;
    // 0x0024F8: 0x3859103F80072538 Fadd
    temp_1460 = 0.0 - temp_1098;
    temp_1461 = temp_1460 + 1.0;
    // 0x002508: 0x5C58100001471D14 Fadd
    temp_1462 = temp_1401 + temp_1455;
    // 0x002510: 0x59A2070001171812 Ffma
    temp_1463 = 0.0 - temp_1450;
    temp_1464 = fma(temp_1439, temp_1442, temp_1463);
    // 0x002518: 0x4C68101002C7260E Fmul
    temp_1465 = temp_1155 * gsys_context.data[11].x;
    // 0x002528: 0x4C58101008F72A18 Fadd
    temp_1466 = temp_1280 + gsys_context.data[35].w;
    // 0x002530: 0x49A0029003572405 Ffma
    temp_1467 = fma(temp_1159, gsys_context.data[13].y, temp_1457);
    // 0x002538: 0x49A0069003272236 Ffma
    temp_1468 = fma(temp_1175, gsys_context.data[12].z, temp_1458);
    // 0x002548: 0x39A0007FFFF7022A Sel
    temp_1469 = temp_1130 ? temp_1453 : -1;
    // 0x002550: 0x010404000007F01D Mov32i
    // 0x002558: 0x5CB8000002A72A2A I2f
    temp_1470 = float(temp_1469);
    // 0x002568: 0x49A0071002D72415 Ffma
    temp_1471 = fma(temp_1159, gsys_context.data[11].y, temp_1465);
    // 0x002570: 0x5C6257800327350E Fmnmx
    temp_1472 = abs(temp_1388);
    temp_1473 = abs(temp_1389);
    temp_1474 = max(temp_1472, temp_1473);
    // 0x002578: 0x49A002900367221C Ffma
    temp_1475 = fma(temp_1175, gsys_context.data[13].z, temp_1467);
    // 0x002588: 0x4C6812240E170405 Fmul
    temp_1476 = temp_1438 * 0.5;
    temp_1477 = temp_1476 * gsys_environment.data[56].y;
    // 0x002590: 0x5C68100001A71802 Fmul
    temp_1478 = temp_1466 * temp_1347;
    // 0x002598: 0x49A00A9002E72215 Ffma
    temp_1479 = fma(temp_1175, gsys_context.data[11].z, temp_1471);
    // 0x0025A8: 0x5C60578000E71016 Fmnmx
    temp_1480 = abs(temp_1409);
    temp_1481 = max(temp_1480, temp_1474);
    // 0x0025B0: 0x5C90008000C7000E Rro
    // 0x0025B8: 0x5080000000471633 Mufu
    temp_1482 = 1.0 / temp_1481;
    // 0x0025C8: 0x39A000FFFFF7030C Sel
    temp_1483 = temp_1146 ? temp_1456 : -1;
    // 0x0025D0: 0x5080000000270E0E Mufu
    temp_1484 = exp2(temp_1454);
    // 0x0025D8: 0x5C68100001A73F03 Fmul
    temp_1485 = temp_1387 * temp_1347;
    // 0x0025E8: 0x5CB8000000C72A0C I2f
    temp_1486 = float(temp_1483);
    // 0x0025F0: 0x5C6257800157360D Fmnmx
    temp_1487 = abs(temp_1468);
    temp_1488 = abs(temp_1479);
    temp_1489 = max(temp_1487, temp_1488);
    // 0x0025F8: 0x59A0028000572A16 Ffma
    temp_1490 = fma(temp_1470, temp_1477, temp_1477);
    // 0x002608: 0x5C60578000D71C18 Fmnmx
    temp_1491 = abs(temp_1475);
    temp_1492 = max(temp_1491, temp_1489);
    // 0x002610: 0x5CB0100000C7090C F2i
    temp_1493 = roundEven(temp_1486);
    temp_1494 = max(temp_1493, 0.0);
    temp_1495 = uint(temp_1494);
    temp_1496 = clamp(temp_1495, 0u, 0xFFFFu);
    // 0x002618: 0x4C6812240E07040D Fmul
    temp_1497 = temp_1438 * 0.5;
    temp_1498 = temp_1497 * gsys_environment.data[56].x;
    // 0x002628: 0x5C68100003373504 Fmul
    temp_1499 = temp_1388 * temp_1482;
    // 0x002630: 0x5C68100003373205 Fmul
    temp_1500 = temp_1389 * temp_1482;
    // 0x002638: 0x5C6910000337101E Fmul
    temp_1501 = 0.0 - temp_1482;
    temp_1502 = temp_1409 * temp_1501;
    // 0x002648: 0x5080000000471833 Mufu
    temp_1503 = 1.0 / temp_1492;
    // 0x002650: 0x49A1072406F70E10 Ffma
    temp_1504 = 0.0 - gsys_environment.data[27].w;
    temp_1505 = fma(temp_1484, temp_1504, temp_1484);
    // 0x002658: 0x59A00B0001171F0E Ffma
    temp_1506 = fma(temp_1459, temp_1442, temp_1490);
    // 0x002668: 0x59A0068000D72A1A Ffma
    temp_1507 = fma(temp_1470, temp_1498, temp_1498);
    // 0x002670: 0x59A20B0001171F16 Ffma
    temp_1508 = 0.0 - temp_1490;
    temp_1509 = fma(temp_1459, temp_1442, temp_1508);
    // 0x002678: 0x49A0170401572B35 Ffma
    temp_1510 = fma(temp_1260, fp_c1.data[5].y, 1.0);
    // 0x002688: 0x4C6017840087122B Fmnmx
    temp_1511 = max(temp_1464, fp_c1.data[2].x);
    // 0x002690: 0x4C58102406F71010 Fadd
    temp_1512 = temp_1505 + gsys_environment.data[27].w;
    // 0x002698: 0x5C98078000E70012 Mov
    // 0x0026A8: 0x59A00D000117140D Ffma
    temp_1513 = fma(temp_1462, temp_1442, temp_1507);
    // 0x0026B0: 0x59A20D0001171411 Ffma
    temp_1514 = 0.0 - temp_1507;
    temp_1515 = fma(temp_1462, temp_1442, temp_1514);
    // 0x0026B8: 0x5C98078000C70014 Mov
    // 0x0026C8: 0x5C98078000C70018 Mov
    // 0x0026D0: 0x32A014BF00071034 Ffma
    temp_1516 = fma(temp_1512, 0.5, 0.5);
    // 0x0026D8: 0x5C68100003371532 Fmul
    temp_1517 = temp_1479 * temp_1503;
    // 0x0026E8: 0x5C98078000C70010 Mov
    // 0x0026F0: 0xC1BE0140B2A70C0C Tex
    temp_1518 = textureLod(cTex_DepthShadowCascade, vec4(temp_1513, temp_1506, float(int(temp_1496)), temp_1511), temp_1470);
    // 0x0026F8: 0x5C98078000D70015 Mov
    // 0x002708: 0x5C69100003371C1C Fmul
    temp_1519 = 0.0 - temp_1503;
    temp_1520 = temp_1475 * temp_1519;
    // 0x002710: 0xC1BE0140B2A71415 Tex
    temp_1521 = textureLod(cTex_DepthShadowCascade, vec4(temp_1513, temp_1509, float(int(temp_1496)), temp_1511), temp_1470);
    // 0x002718: 0xC1BE0140B2A71010 Tex
    temp_1522 = textureLod(cTex_DepthShadowCascade, vec4(temp_1515, temp_1506, float(int(temp_1496)), temp_1511), temp_1470);
    // 0x002728: 0x5C9807800167001A Mov
    // 0x002730: 0x5C98078001170019 Mov
    // 0x002738: 0x5C68100003373633 Fmul
    temp_1523 = temp_1468 * temp_1503;
    // 0x002748: 0xC1BE0140B2A71818 Tex
    temp_1524 = textureLod(cTex_DepthShadowCascade, vec4(temp_1515, temp_1509, float(int(temp_1496)), temp_1511), temp_1470);
    // 0x002750: 0x386810404007381F Fmul
    temp_1525 = temp_1461 * 3.0;
    // 0x002758: 0xD9A2018321C7321C Texs
    temp_1526 = textureLod(cTex_CubeEnvMap, vec3(temp_1517, temp_1523, temp_1520), 3.0).xyz;
    temp_1527 = temp_1526.x;
    temp_1528 = temp_1526.y;
    temp_1529 = temp_1526.z;
    // 0x002768: 0xD86201EFF4070202 Texs
    temp_1530 = textureLod(cTex_Projection0, vec2(temp_1478, temp_1485), temp_1417).x;
    // 0x002770: 0xD82201C393473534 Texs
    temp_1531 = texture(cTex_SkyInscatter, vec2(temp_1510, temp_1516)).xyz;
    temp_1532 = temp_1531.x;
    temp_1533 = temp_1531.y;
    temp_1534 = temp_1531.z;
    // 0x002778: 0xD9A20181E1E70404 Texs
    temp_1535 = textureLod(cTex_CubeEnvMap, vec3(temp_1499, temp_1500, temp_1502), temp_1525).xyz;
    temp_1536 = temp_1535.x;
    temp_1537 = temp_1535.y;
    temp_1538 = temp_1535.z;
    // 0x002788: 0x4C6810240AC70808 Fmul
    temp_1539 = temp_173 * gsys_environment.data[43].x;
    // 0x002790: 0x4C9807B40727003A Mov
    // 0x002798: 0x4C68102406C73131 Fmul
    temp_1540 = temp_1407 * gsys_environment.data[27].x;
    // 0x0027A8: 0x5C5D30000FF72D2D Fadd
    temp_1541 = 0.0 - temp_1242;
    temp_1542 = temp_1541 + -0.0;
    temp_1543 = clamp(temp_1542, 0.0, 1.0);
    // 0x0027B0: 0x010408000007F03C Mov32i
    // 0x0027B8: 0x4C68101000173B0D Fmul
    temp_1544 = temp_62 * gsys_context.data[0].y;
    // 0x0027C8: 0x01042C800007F00E Mov32i
    // 0x0027D0: 0x49A004240AD70908 Ffma
    temp_1545 = fma(temp_174, gsys_environment.data[43].y, temp_1539);
    // 0x0027D8: 0x4C6810340E471709 Fmul
    temp_1546 = temp_171 * gsys_scene_material.data[57].x;
    // 0x0027E8: 0x5C68100002772711 Fmul
    temp_1547 = temp_66 * temp_66;
    // 0x0027F0: 0x4C9807B400A70016 Mov
    // 0x0027F8: 0x49A006900057370D Ffma
    temp_1548 = fma(temp_63, gsys_context.data[1].y, temp_1544);
    // 0x002808: 0x4C58102401173737 Fadd
    temp_1549 = temp_63 + gsys_environment.data[4].y;
    // 0x002810: 0x32A0074496070B03 Ffma
    temp_1550 = fma(temp_176, 1200.0, 100.0);
    // 0x002818: 0x49A004240AE70A08 Ffma
    temp_1551 = fma(temp_175, gsys_environment.data[43].z, temp_1545);
    // 0x002828: 0x4C9807B40C57000E Mov
    // 0x002830: 0x4C58102401272F19 Fadd
    temp_1552 = temp_64 + gsys_environment.data[4].z;
    // 0x002838: 0x3859103F8007090A Fadd
    temp_1553 = 0.0 - temp_1546;
    temp_1554 = temp_1553 + 1.0;
    // 0x002848: 0x59A008800377371A Ffma
    temp_1555 = fma(temp_1549, temp_1549, temp_1547);
    // 0x002850: 0x5BB1838000373D07 Fsetp
    temp_1556 = temp_451 < temp_1550;
    // 0x002858: 0x5C68100000870808 Fmul
    temp_1557 = temp_1551 * temp_1551;
    // 0x002868: 0x51A407340C770103 Ffma
    temp_1558 = fma(temp_505, gsys_scene_material.data[49].y, gsys_scene_material.data[49].w);
    temp_1559 = clamp(temp_1558, 0.0, 1.0);
    // 0x002870: 0x508040000037010E Mufu
    temp_1560 = abs(temp_505);
    temp_1561 = log2(temp_1560);
    // 0x002878: 0x49A0170400E70711 Ffma
    temp_1562 = fma(temp_170, fp_c1.data[3].z, 1.0);
    // 0x002888: 0x49A0170400E70912 Ffma
    temp_1563 = fma(temp_1546, fp_c1.data[3].z, 1.0);
    // 0x002890: 0x59A1050000A70914 Ffma
    temp_1564 = 0.0 - temp_1554;
    temp_1565 = fma(temp_1546, temp_1564, temp_1554);
    // 0x002898: 0x59A00D000197191A Ffma
    temp_1566 = fma(temp_1552, temp_1552, temp_1555);
    // 0x0028A8: 0x51A10B3400A7080A Ffma
    temp_1567 = 0.0 - gsys_scene_material.data[2].z;
    temp_1568 = fma(temp_1557, temp_1567, gsys_scene_material.data[2].z);
    // 0x0028B0: 0x5080000000571A16 Mufu
    temp_1569 = inversesqrt(temp_1566);
    // 0x0028B8: 0x49A4069000972F2F Ffma
    temp_1570 = fma(temp_64, gsys_context.data[2].y, temp_1548);
    temp_1571 = clamp(temp_1570, 0.0, 1.0);
    // 0x0028C8: 0x5C6810000127110D Fmul
    temp_1572 = temp_1562 * temp_1563;
    // 0x0028D0: 0x5080000000372F2F Mufu
    temp_1573 = log2(temp_1571);
    // 0x0028D8: 0x5C68100001471101 Fmul
    temp_1574 = temp_1562 * temp_1565;
    // 0x0028E8: 0x4C9807A40C470011 Mov
    // 0x0028F0: 0x4C58102401073B3B Fadd
    temp_1575 = temp_62 + gsys_environment.data[4].x;
    // 0x0028F8: 0x4C6810340C670E0E Fmul
    temp_1576 = temp_1561 * gsys_scene_material.data[49].z;
    // 0x002908: 0x4C9807A407070012 Mov
    // 0x002910: 0x5C58100000A7080A Fadd
    temp_1577 = temp_1557 + temp_1568;
    // 0x002918: 0x33A01EC496000B0B Ffma
    temp_1578 = temp_1565;
    temp_1579 = temp_1559;
    if (temp_1556)
    {
        temp_1580 = fma(temp_176, -1200.0, temp_451);
        temp_182 = temp_1580;
    }
    temp_1581 = temp_182;
    // 0x002928: 0x51A408A40C571311 Ffma
    temp_1582 = fma(temp_500, gsys_environment.data[49].x, gsys_environment.data[49].y);
    temp_1583 = clamp(temp_1582, 0.0, 1.0);
    // 0x002930: 0x4C9807A40B000014 Mov
    temp_1584 = temp_1581;
    temp_1585 = temp_1583;
    if (temp_1556)
    {
        temp_1578 = gsys_environment.data[44].x;
    }
    temp_1586 = temp_1578;
    // 0x002938: 0x5C68100001673B3B Fmul
    temp_1587 = temp_1575 * temp_1569;
    // 0x002948: 0x5C68100001673737 Fmul
    temp_1588 = temp_1549 * temp_1569;
    // 0x002950: 0x5C90008000E70008 Rro
    // 0x002958: 0x51A609240717130E Ffma
    temp_1589 = 0.0 - gsys_environment.data[28].y;
    temp_1590 = fma(temp_500, gsys_environment.data[28].x, temp_1589);
    temp_1591 = clamp(temp_1590, 0.0, 1.0);
    // 0x002968: 0x5080000000270808 Mufu
    temp_1592 = exp2(temp_1576);
    // 0x002970: 0x59A2088001170A12 Ffma
    temp_1593 = 0.0 - temp_1583;
    temp_1594 = fma(temp_1577, temp_1583, temp_1593);
    // 0x002978: 0x1EA3C23D70A00B0B Fmul32i
    temp_1595 = temp_1591;
    if (temp_1556)
    {
        temp_1596 = temp_1581 * 0.00999999978;
        temp_1597 = clamp(temp_1596, 0.0, 1.0);
        temp_1584 = temp_1597;
    }
    temp_1598 = temp_1584;
    // 0x002988: 0x51A40A240B103D11 Ffma
    if (temp_1556)
    {
        temp_1599 = fma(temp_451, temp_1586, gsys_environment.data[44].y);
        temp_1600 = clamp(temp_1599, 0.0, 1.0);
        temp_1585 = temp_1600;
    }
    temp_1601 = temp_1585;
    // 0x002990: 0x4C68103400B73B3B Fmul
    temp_1602 = temp_1587 * gsys_scene_material.data[2].w;
    // 0x002998: 0x4C9807A40547001A Mov
    // 0x0029A8: 0x3859103F80070E19 Fadd
    temp_1603 = 0.0 - temp_1591;
    temp_1604 = temp_1603 + 1.0;
    // 0x0029B0: 0x4C68103400B7370A Fmul
    temp_1605 = temp_1588 * gsys_scene_material.data[2].w;
    // 0x0029B8: 0x5080000000371919 Mufu
    temp_1606 = log2(temp_1604);
    // 0x0029C8: 0x3859103F80000B0E Fadd
    temp_1607 = temp_1601;
    if (temp_1556)
    {
        temp_1608 = 0.0 - temp_1598;
        temp_1609 = temp_1608 + 1.0;
        temp_1595 = temp_1609;
    }
    temp_1610 = temp_1595;
    // 0x0029D0: 0x3859103F80001111 Fadd
    if (temp_1556)
    {
        temp_1611 = 0.0 - temp_1601;
        temp_1612 = temp_1611 + 1.0;
        temp_1607 = temp_1612;
    }
    temp_1613 = temp_1607;
    // 0x0029D8: 0x5C69100002673B0B Fmul
    temp_1614 = 0.0 - temp_1155;
    temp_1615 = temp_1602 * temp_1614;
    // 0x0029E8: 0x51A11D3407270000 Ffma
    temp_1616 = 0.0 - gsys_scene_material.data[28].z;
    temp_1617 = fma(temp_167, temp_1616, gsys_scene_material.data[28].z);
    // 0x0029F0: 0x5C59100000370816 Fadd
    temp_1618 = 0.0 - temp_1592;
    temp_1619 = temp_1618 + temp_1559;
    // 0x0029F8: 0x51A40D240537131A Ffma
    temp_1620 = fma(temp_500, gsys_environment.data[21].x, gsys_environment.data[20].w);
    temp_1621 = clamp(temp_1620, 0.0, 1.0);
    // 0x002A08: 0x4C68102407672F2F Fmul
    temp_1622 = temp_1573 * gsys_environment.data[29].z;
    // 0x002A10: 0x5080000000371A1A Mufu
    temp_1623 = log2(temp_1621);
    // 0x002A18: 0x5C60138001100E03 Fmnmx
    if (temp_1556)
    {
        temp_1624 = min(temp_1610, temp_1613);
        temp_1579 = temp_1624;
    }
    temp_1625 = temp_1579;
    // 0x002A28: 0x59A1058002470A11 Ffma
    temp_1626 = 0.0 - temp_1159;
    temp_1627 = fma(temp_1605, temp_1626, temp_1615);
    // 0x002A30: 0x385D103F80070014 Fadd
    temp_1628 = 0.0 - temp_1617;
    temp_1629 = temp_1628 + 1.0;
    temp_1630 = clamp(temp_1629, 0.0, 1.0);
    // 0x002A38: 0x49A004340C471600 Ffma
    temp_1631 = fma(temp_1619, gsys_scene_material.data[49].x, temp_1592);
    // 0x002A48: 0x51A41C0400C7380E Ffma
    temp_1632 = fma(temp_1461, temp_1461, fp_c1.data[3].x);
    temp_1633 = clamp(temp_1632, 0.0, 1.0);
    // 0x002A50: 0x4C68102407471919 Fmul
    temp_1634 = temp_1606 * gsys_environment.data[29].x;
    // 0x002A58: 0x5C90008003170016 Rro
    // 0x002A68: 0x59A508800227230B Ffma
    temp_1635 = 0.0 - temp_1175;
    temp_1636 = fma(temp_484, temp_1635, temp_1627);
    temp_1637 = clamp(temp_1636, 0.0, 1.0);
    // 0x002A70: 0x5080000000271616 Mufu
    temp_1638 = exp2(temp_1540);
    // 0x002A78: 0x59A00A0001471208 Ffma
    temp_1639 = fma(temp_1594, temp_1630, temp_1630);
    // 0x002A88: 0x5C90008002F70014 Rro
    // 0x002A90: 0x5C68100003B72811 Fmul
    temp_1640 = temp_1125 * temp_1602;
    // 0x002A98: 0x5080000000271414 Mufu
    temp_1641 = exp2(temp_1622);
    // 0x002AA8: 0x5C68100000E70E0E Fmul
    temp_1642 = temp_1633 * temp_1633;
    // 0x002AB0: 0x5C68100000B70B0B Fmul
    temp_1643 = temp_1637 * temp_1637;
    // 0x002AB8: 0x4C68102405571A1A Fmul
    temp_1644 = temp_1623 * gsys_environment.data[21].y;
    // 0x002AC8: 0x5C90008001970012 Rro
    // 0x002AD0: 0x32A014BF00073838 Ffma
    temp_1645 = fma(temp_1461, 0.5, 0.5);
    // 0x002AD8: 0x5080000000271212 Mufu
    temp_1646 = exp2(temp_1634);
    // 0x002AE8: 0x59A0088000A71B11 Ffma
    temp_1647 = fma(temp_1223, temp_1605, temp_1640);
    // 0x002AF0: 0x59A2058000B70E0B Ffma
    temp_1648 = 0.0 - temp_1643;
    temp_1649 = fma(temp_1642, temp_1643, temp_1648);
    // 0x002AF8: 0x4C9807A406E70019 Mov
    // 0x002B08: 0x3859103F80072D0A Fadd
    temp_1650 = 0.0 - temp_1543;
    temp_1651 = temp_1650 + 1.0;
    // 0x002B10: 0x5C69100002672826 Fmul
    temp_1652 = 0.0 - temp_1155;
    temp_1653 = temp_1125 * temp_1652;
    // 0x002B18: 0x5C90008001A7001A Rro
    // 0x002B28: 0x49A1172407771414 Ffma
    temp_1654 = 0.0 - gsys_environment.data[29].w;
    temp_1655 = fma(temp_1641, temp_1654, 1.0);
    // 0x002B30: 0x5080000000271A1F Mufu
    temp_1656 = exp2(temp_1644);
    // 0x002B38: 0x5C68120003873838 Fmul
    temp_1657 = temp_1645 * 0.5;
    temp_1658 = temp_1657 * temp_1645;
    // 0x002B48: 0x3858103F80070B0B Fadd
    temp_1659 = temp_1649 + 1.0;
    // 0x002B50: 0x59A1130002471B1B Ffma
    temp_1660 = 0.0 - temp_1159;
    temp_1661 = fma(temp_1223, temp_1660, temp_1653);
    // 0x002B58: 0x33A01E4040072525 Ffma
    temp_1662 = fma(temp_1098, -3.0, 4.0);
    // 0x002B68: 0x59A4088002373023 Ffma
    temp_1663 = fma(temp_1127, temp_484, temp_1647);
    temp_1664 = clamp(temp_1663, 0.0, 1.0);
    // 0x002B70: 0x5080000000472525 Mufu
    temp_1665 = 1.0 / temp_1662;
    // 0x002B78: 0x49A6170400A7132E Ffma
    temp_1666 = fma(temp_500, fp_c1.data[2].z, -1.0);
    temp_1667 = clamp(temp_1666, 0.0, 1.0);
    // 0x002B88: 0x51A10CA406E7161A Ffma
    temp_1668 = 0.0 - gsys_environment.data[27].z;
    temp_1669 = fma(temp_1638, temp_1668, gsys_environment.data[27].z);
    // 0x002B90: 0x5C68100000A70A19 Fmul
    temp_1670 = temp_1651 * temp_1651;
    // 0x002B98: 0x59A10A0001271416 Ffma
    temp_1671 = 0.0 - temp_1646;
    temp_1672 = fma(temp_1655, temp_1671, temp_1655);
    // 0x002BA8: 0x59A1058000B73814 Ffma
    temp_1673 = 0.0 - temp_1659;
    temp_1674 = fma(temp_1658, temp_1673, temp_1659);
    // 0x002BB0: 0x5C68100000B7380B Fmul
    temp_1675 = temp_1658 * temp_1659;
    // 0x002BB8: 0x59A50D8002273022 Ffma
    temp_1676 = 0.0 - temp_1175;
    temp_1677 = fma(temp_1127, temp_1676, temp_1661);
    temp_1678 = clamp(temp_1677, 0.0, 1.0);
    // 0x002BC8: 0x4C68102404F71F1F Fmul
    temp_1679 = temp_1656 * gsys_environment.data[19].w;
    // 0x002BD0: 0x5C68100001970A12 Fmul
    temp_1680 = temp_1651 * temp_1670;
    // 0x002BD8: 0x4C68102407B71616 Fmul
    temp_1681 = temp_1672 * gsys_environment.data[30].w;
    // 0x002BE8: 0x3859103F80072323 Fadd
    temp_1682 = 0.0 - temp_1664;
    temp_1683 = temp_1682 + 1.0;
    // 0x002BF0: 0x59A0058002D7142D Ffma
    temp_1684 = fma(temp_1674, temp_1543, temp_1675);
    // 0x002BF8: 0x59A0058001472214 Ffma
    temp_1685 = fma(temp_1678, temp_1674, temp_1675);
    // 0x002C08: 0x5C68100001F7090A Fmul
    temp_1686 = temp_1546 * temp_1679;
    // 0x002C10: 0x5C68100001271912 Fmul
    temp_1687 = temp_1670 * temp_1680;
    // 0x002C18: 0x5C68100001A70D11 Fmul
    temp_1688 = temp_1572 * temp_1669;
    // 0x002C28: 0x5C68100000D71609 Fmul
    temp_1689 = temp_1681 * temp_1572;
    // 0x002C30: 0x4C9807B409C7000D Mov
    // 0x002C38: 0x5C68100001472D14 Fmul
    temp_1690 = temp_1684 * temp_1685;
    // 0x002C48: 0x4C9807B409E70019 Mov
    // 0x002C50: 0x5080000000471414 Mufu
    temp_1691 = 1.0 / temp_1690;
    // 0x002C58: 0x5C68100002571212 Fmul
    temp_1692 = temp_1687 * temp_1665;
    // 0x002C68: 0x32A014BF0007360B Ffma
    temp_1693 = fma(temp_1468, 0.5, 0.5);
    // 0x002C70: 0x4C59103409870D0D Fadd
    temp_1694 = 0.0 - gsys_scene_material.data[39].x;
    temp_1695 = temp_1694 + gsys_scene_material.data[38].x;
    // 0x002C78: 0x4C9807B40907001A Mov
    // 0x002C88: 0x0103E19999A7F01B Mov32i
    // 0x002C90: 0x4C68102414771717 Fmul
    temp_1696 = temp_171 * gsys_environment.data[81].w;
    // 0x002C98: 0x49A0090400B71216 Ffma
    temp_1697 = fma(temp_1692, fp_c1.data[2].w, temp_1692);
    // 0x002CA8: 0x5C9807800FF80003 Mov
    temp_1698 = temp_1625;
    if (!temp_1556)
    {
        temp_1698 = 0.0;
    }
    temp_1699 = temp_1698;
    // 0x002CB0: 0x51A005B409C70D0D Ffma
    temp_1700 = fma(temp_1695, temp_1693, gsys_scene_material.data[39].x);
    // 0x002CB8: 0x4C68103400B72C2C Fmul
    temp_1701 = gsys_scene_material.data[2].w * gsys_scene_material.data[2].w;
    // 0x002CC8: 0x49A00D8400D7001B Ffma
    temp_1702 = fma(temp_1631, fp_c1.data[3].y, 0.150000006);
    // 0x002CD0: 0x0883D23D70A71616 Fadd32i
    temp_1703 = temp_1697 + 0.0399999991;
    // 0x002CD8: 0x5C68100001671B1B Fmul
    temp_1704 = temp_1702 * temp_1703;
    // 0x002CE8: 0x0103FE666667F016 Mov32i
    // 0x002CF0: 0x49A20B0401471316 Ffma
    temp_1705 = fma(temp_500, fp_c1.data[5].x, -1.79999995);
    // 0x002CF8: 0xF0F0000034270000 Depbar
    // 0x002D08: 0x5C58100001570C15 Fadd
    temp_1706 = temp_1518 + temp_1521;
    // 0x002D10: 0x5C6810000237230C Fmul
    temp_1707 = temp_1683 * temp_1683;
    // 0x002D18: 0x5C58100001071515 Fadd
    temp_1708 = temp_1706 + temp_1522;
    // 0x002D28: 0x4C9807B409D70010 Mov
    // 0x002D30: 0x5C68100000C72323 Fmul
    temp_1709 = temp_1683 * temp_1707;
    // 0x002D38: 0x5C60178003271D1F Fmnmx
    temp_1710 = max(temp_1528, temp_1529);
    // 0x002D48: 0x5C58100001571818 Fadd
    temp_1711 = temp_1524 + temp_1708;
    // 0x002D50: 0x4C59103409971012 Fadd
    temp_1712 = 0.0 - gsys_scene_material.data[39].y;
    temp_1713 = temp_1712 + gsys_scene_material.data[38].y;
    // 0x002D58: 0x4C59103409A71910 Fadd
    temp_1714 = 0.0 - gsys_scene_material.data[39].z;
    temp_1715 = temp_1714 + gsys_scene_material.data[38].z;
    // 0x002D68: 0x5C60178001F71C1F Fmnmx
    temp_1716 = max(temp_1527, temp_1710);
    // 0x002D70: 0x5C60138003271D15 Fmnmx
    temp_1717 = min(temp_1528, temp_1529);
    // 0x002D78: 0x51A005B409D71212 Ffma
    temp_1718 = fma(temp_1713, temp_1693, gsys_scene_material.data[39].y);
    // 0x002D88: 0x51A005B409E71010 Ffma
    temp_1719 = fma(temp_1715, temp_1693, gsys_scene_material.data[39].z);
    // 0x002D90: 0x5C68100002370C0B Fmul
    temp_1720 = temp_1707 * temp_1709;
    // 0x002D98: 0x5C68100001470E0C Fmul
    temp_1721 = temp_1642 * temp_1691;
    // 0x002DA8: 0x088BE99999A71A0E Fadd32i
    temp_1722 = gsys_scene_material.data[36].x + -0.300000012;
    // 0x002DB0: 0x4C9807A40487001A Mov
    // 0x002DB8: 0x5C58300001F71D1D Fadd
    temp_1723 = 0.0 - temp_1716;
    temp_1724 = temp_1528 + temp_1723;
    // 0x002DC8: 0x5C60138001571C15 Fmnmx
    temp_1725 = min(temp_1527, temp_1717);
    // 0x002DD0: 0x5C58300001F73232 Fadd
    temp_1726 = 0.0 - temp_1716;
    temp_1727 = temp_1529 + temp_1726;
    // 0x002DD8: 0x5C58300001F71C1C Fadd
    temp_1728 = 0.0 - temp_1716;
    temp_1729 = temp_1527 + temp_1728;
    // 0x002DE8: 0x1EA4020000170E0E Fmul32i
    temp_1730 = temp_1722 * 2.50000024;
    temp_1731 = clamp(temp_1730, 0.0, 1.0);
    // 0x002DF0: 0x49A0058400B70B0B Ffma
    temp_1732 = fma(temp_1720, fp_c1.data[2].w, temp_1720);
    // 0x002DF8: 0x1E23DCCCCCD70E14 Fmul32i
    temp_1733 = temp_1731 * 0.100000001;
    // 0x002E08: 0x0882EDBE6FF71F0E Fadd32i
    temp_1734 = temp_1716 + 1.00000001E-10;
    // 0x002E10: 0x0883D23D70A70B0B Fadd32i
    temp_1735 = temp_1732 + 0.0399999991;
    // 0x002E18: 0x5080000000470E0E Mufu
    temp_1736 = 1.0 / temp_1734;
    // 0x002E28: 0x59A50B0001671416 Ffma
    temp_1737 = 0.0 - temp_1705;
    temp_1738 = fma(temp_1733, temp_1737, temp_1705);
    temp_1739 = clamp(temp_1738, 0.0, 1.0);
    // 0x002E30: 0x5C58100001671419 Fadd
    temp_1740 = temp_1733 + temp_1739;
    // 0x002E38: 0x51A40D2404771314 Ffma
    temp_1741 = fma(temp_500, gsys_environment.data[18].x, gsys_environment.data[17].w);
    temp_1742 = clamp(temp_1741, 0.0, 1.0);
    // 0x002E48: 0x4C59102411673D13 Fadd
    temp_1743 = 0.0 - temp_451;
    temp_1744 = temp_1743 + gsys_environment.data[69].z;
    // 0x002E50: 0x5080000000371414 Mufu
    temp_1745 = log2(temp_1742);
    // 0x002E58: 0x51A10A8400070E15 Ffma
    temp_1746 = 0.0 - temp_1725;
    temp_1747 = fma(temp_1736, temp_1746, fp_c1.data[0].x);
    // 0x002E68: 0x4C9807B40957000E Mov
    // 0x002E70: 0x59A1030001970606 Ffma
    temp_1748 = 0.0 - temp_1740;
    temp_1749 = fma(temp_169, temp_1748, temp_169);
    // 0x002E78: 0x4C60178400971515 Fmnmx
    temp_1750 = max(temp_1747, fp_c1.data[2].y);
    // 0x002E88: 0x3958103F80070E0E Fadd
    temp_1751 = gsys_scene_material.data[37].y + -1.0;
    // 0x002E90: 0x5080000000371515 Mufu
    temp_1752 = log2(temp_1750);
    // 0x002E98: 0x5C58100000671906 Fadd
    temp_1753 = temp_1740 + temp_1749;
    // 0x002EA8: 0x4C9807A411570019 Mov
    // 0x002EB0: 0x4C68102404971416 Fmul
    temp_1754 = temp_1745 * gsys_environment.data[18].y;
    // 0x002EB8: 0xF0F0000034170000 Depbar
    // 0x002EC8: 0x5C68100003470634 Fmul
    temp_1755 = temp_1753 * temp_1532;
    // 0x002ED0: 0x51A40CA411471313 Ffma
    temp_1756 = fma(temp_1744, gsys_environment.data[69].y, gsys_environment.data[69].x);
    temp_1757 = clamp(temp_1756, 0.0, 1.0);
    // 0x002ED8: 0x5C90008001670019 Rro
    // 0x002EE8: 0x5080000000271916 Mufu
    temp_1758 = exp2(temp_1754);
    // 0x002EF0: 0x5C68100001570E0E Fmul
    temp_1759 = temp_1751 * temp_1752;
    // 0x002EF8: 0x4C68102411371313 Fmul
    temp_1760 = temp_1757 * gsys_environment.data[68].w;
    // 0x002F08: 0x5C90008000E7001A Rro
    // 0x002F10: 0x5C68100000171314 Fmul
    temp_1761 = temp_1760 * temp_1574;
    // 0x002F18: 0x5080000000271A0E Mufu
    temp_1762 = exp2(temp_1759);
    // 0x002F28: 0x3859103F80070913 Fadd
    temp_1763 = 0.0 - temp_1689;
    temp_1764 = temp_1763 + 1.0;
    // 0x002F30: 0x4C68102404371616 Fmul
    temp_1765 = temp_1758 * gsys_environment.data[16].w;
    // 0x002F38: 0x59A1098001371115 Ffma
    temp_1766 = 0.0 - temp_1764;
    temp_1767 = fma(temp_1688, temp_1766, temp_1764);
    // 0x002F48: 0x5C68100001371101 Fmul
    temp_1768 = temp_1688 * temp_1764;
    // 0x002F50: 0x5C68100001670716 Fmul
    temp_1769 = temp_170 * temp_1765;
    // 0x002F58: 0x4C68103409670E11 Fmul
    temp_1770 = temp_1762 * gsys_scene_material.data[37].z;
    // 0x002F68: 0x59A10A8001571419 Ffma
    temp_1771 = 0.0 - temp_1767;
    temp_1772 = fma(temp_1761, temp_1771, temp_1767);
    // 0x002F70: 0x5C6810000157140E Fmul
    temp_1773 = temp_1761 * temp_1767;
    // 0x002F78: 0x3859103F80071613 Fadd
    temp_1774 = 0.0 - temp_1769;
    temp_1775 = temp_1774 + 1.0;
    // 0x002F88: 0x4C68102400770714 Fmul
    temp_1776 = temp_170 * gsys_environment.data[1].w;
    // 0x002F90: 0x59A00F8001171D1D Ffma
    temp_1777 = fma(temp_1724, temp_1770, temp_1716);
    // 0x002F98: 0x59A00F8001173232 Ffma
    temp_1778 = fma(temp_1727, temp_1770, temp_1716);
    // 0x002FA8: 0x5C68100001671923 Fmul
    temp_1779 = temp_1772 * temp_1769;
    // 0x002FB0: 0x59A1098001370A07 Ffma
    temp_1780 = 0.0 - temp_1775;
    temp_1781 = fma(temp_1686, temp_1780, temp_1775);
    // 0x002FB8: 0x59A00F8001171C1C Ffma
    temp_1782 = fma(temp_1729, temp_1770, temp_1716);
    // 0x002FC8: 0x49A1093409471D13 Ffma
    temp_1783 = 0.0 - gsys_scene_material.data[37].x;
    temp_1784 = fma(temp_1777, temp_1783, temp_1718);
    // 0x002FD0: 0x5C68100000A71912 Fmul
    temp_1785 = temp_1772 * temp_1686;
    // 0x002FD8: 0x49A1083409473210 Ffma
    temp_1786 = 0.0 - gsys_scene_material.data[37].x;
    temp_1787 = fma(temp_1778, temp_1786, temp_1719);
    // 0x002FE8: 0x4C68103409473211 Fmul
    temp_1788 = temp_1778 * gsys_scene_material.data[37].x;
    // 0x002FF0: 0x5C68100000771907 Fmul
    temp_1789 = temp_1772 * temp_1781;
    // 0x002FF8: 0x4C68103409471D1D Fmul
    temp_1790 = temp_1777 * gsys_scene_material.data[37].x;
    // 0x003008: 0x49A20A240057140A Ffma
    temp_1791 = 0.0 - temp_1776;
    temp_1792 = fma(temp_1776, gsys_environment.data[1].y, temp_1791);
    // 0x003010: 0x4C68102404D71216 Fmul
    temp_1793 = temp_1785 * gsys_environment.data[19].y;
    // 0x003018: 0x4C68102404C71215 Fmul
    temp_1794 = temp_1785 * gsys_environment.data[19].x;
    // 0x003028: 0x4C68102404E71212 Fmul
    temp_1795 = temp_1785 * gsys_environment.data[19].z;
    // 0x003030: 0x59A0088002E71010 Ffma
    temp_1796 = fma(temp_1787, temp_1667, temp_1788);
    // 0x003038: 0x0103E8000007F011 Mov32i
    // 0x003048: 0x59A00E8002E71313 Ffma
    temp_1797 = fma(temp_1784, temp_1667, temp_1790);
    // 0x003050: 0x49A00B2404172319 Ffma
    temp_1798 = fma(temp_1779, gsys_environment.data[16].y, temp_1793);
    // 0x003058: 0x49A00AA404072315 Ffma
    temp_1799 = fma(temp_1779, gsys_environment.data[16].x, temp_1794);
    // 0x003068: 0x49A0092404272323 Ffma
    temp_1800 = fma(temp_1779, gsys_environment.data[16].z, temp_1795);
    // 0x003070: 0x4C5C103400670212 Fadd
    temp_1801 = temp_1530 + gsys_scene_material.data[1].z;
    temp_1802 = clamp(temp_1801, 0.0, 1.0);
    // 0x003078: 0x49A106B409471C0D Ffma
    temp_1803 = 0.0 - gsys_scene_material.data[37].x;
    temp_1804 = fma(temp_1782, temp_1803, temp_1700);
    // 0x003088: 0x49A20A2400671402 Ffma
    temp_1805 = 0.0 - temp_1776;
    temp_1806 = fma(temp_1776, gsys_environment.data[1].z, temp_1805);
    // 0x003090: 0x4C68103409471C1C Fmul
    temp_1807 = temp_1782 * gsys_scene_material.data[37].x;
    // 0x003098: 0x51A408B400571818 Ffma
    temp_1808 = fma(temp_1711, 0.25, gsys_scene_material.data[1].y);
    temp_1809 = clamp(temp_1808, 0.0, 1.0);
    // 0x0030A8: 0x59A0098000A7130A Ffma
    temp_1810 = fma(temp_1797, temp_1792, temp_1797);
    // 0x0030B0: 0x5C68100000871212 Fmul
    temp_1811 = temp_1802 * temp_1639;
    // 0x0030B8: 0x49A20BA414571708 Ffma
    temp_1812 = 0.0 - temp_1696;
    temp_1813 = fma(temp_1696, gsys_environment.data[81].y, temp_1812);
    // 0x0030C8: 0x59A0080000271002 Ffma
    temp_1814 = fma(temp_1796, temp_1806, temp_1796);
    // 0x0030D0: 0x59A00E0002E70D0D Ffma
    temp_1815 = fma(temp_1804, temp_1667, temp_1807);
    // 0x0030D8: 0x49A20A2400471414 Ffma
    temp_1816 = 0.0 - temp_1776;
    temp_1817 = fma(temp_1776, gsys_environment.data[1].x, temp_1816);
    // 0x0030E8: 0x49A20BA414671710 Ffma
    temp_1818 = 0.0 - temp_1696;
    temp_1819 = fma(temp_1696, gsys_environment.data[81].z, temp_1818);
    // 0x0030F0: 0x59A2018000371212 Ffma
    temp_1820 = 0.0 - temp_1699;
    temp_1821 = fma(temp_1811, temp_1699, temp_1820);
    // 0x0030F8: 0x4C68103400E71818 Fmul
    temp_1822 = temp_1809 * gsys_scene_material.data[3].z;
    // 0x003108: 0x59A0050000870A08 Ffma
    temp_1823 = fma(temp_1810, temp_1813, temp_1810);
    // 0x003110: 0x49A20BA414471717 Ffma
    temp_1824 = 0.0 - temp_1696;
    temp_1825 = fma(temp_1696, gsys_environment.data[81].x, temp_1824);
    // 0x003118: 0x59A0068001470D14 Ffma
    temp_1826 = fma(temp_1815, temp_1817, temp_1815);
    // 0x003128: 0x59A001000107020A Ffma
    temp_1827 = fma(temp_1814, temp_1819, temp_1814);
    // 0x003130: 0x4C9807A40BC70013 Mov
    // 0x003138: 0x59A00C0001871218 Ffma
    temp_1828 = fma(temp_1821, temp_1822, temp_1822);
    // 0x003148: 0x4C6C103407F70012 Fmul
    temp_1829 = temp_1631 * gsys_scene_material.data[31].w;
    temp_1830 = clamp(temp_1829, 0.0, 1.0);
    // 0x003150: 0x0103DCCCCCD7F016 Mov32i
    // 0x003158: 0x59A00A0001771417 Ffma
    temp_1831 = fma(temp_1826, temp_1825, temp_1826);
    // 0x003168: 0x5C60178000A7080D Fmnmx
    temp_1832 = max(temp_1823, temp_1827);
    // 0x003170: 0x51A409A40BD73D3D Ffma
    temp_1833 = fma(temp_451, gsys_environment.data[47].x, gsys_environment.data[47].y);
    temp_1834 = clamp(temp_1833, 0.0, 1.0);
    // 0x003178: 0x4C68103400471810 Fmul
    temp_1835 = temp_1828 * gsys_scene_material.data[1].x;
    // 0x003188: 0x3859104000071212 Fadd
    temp_1836 = 0.0 - temp_1830;
    temp_1837 = temp_1836 + 2.0;
    // 0x003190: 0x5C68100001872218 Fmul
    temp_1838 = temp_1678 * temp_1828;
    // 0x003198: 0x49A00B0400F70016 Ffma
    temp_1839 = fma(temp_1631, fp_c1.data[3].w, 0.100000001);
    // 0x0031A8: 0x5C60178000D71711 Fmnmx
    temp_1840 = max(temp_1831, temp_1832);
    // 0x0031B0: 0x5C68100002C72C0D Fmul
    temp_1841 = temp_1701 * temp_1701;
    // 0x0031B8: 0x5C68100001072210 Fmul
    temp_1842 = temp_1678 * temp_1835;
    // 0x0031C8: 0x49A00CA411170E02 Ffma
    temp_1843 = fma(temp_1773, gsys_environment.data[68].y, temp_1798);
    // 0x0031D0: 0x4C68102401571800 Fmul
    temp_1844 = temp_1838 * gsys_environment.data[5].y;
    // 0x0031D8: 0x49A00AA411070E03 Ffma
    temp_1845 = fma(temp_1773, gsys_environment.data[68].x, temp_1799);
    // 0x0031E8: 0x5C58300001171717 Fadd
    temp_1846 = 0.0 - temp_1840;
    temp_1847 = temp_1831 + temp_1846;
    // 0x0031F0: 0x5C58300001170808 Fadd
    temp_1848 = 0.0 - temp_1840;
    temp_1849 = temp_1823 + temp_1848;
    // 0x0031F8: 0x5C58300001170A0A Fadd
    temp_1850 = 0.0 - temp_1840;
    temp_1851 = temp_1827 + temp_1850;
    // 0x003208: 0x5C68100000D7100D Fmul
    temp_1852 = temp_1842 * temp_1841;
    // 0x003210: 0x49A011A411270E0E Ffma
    temp_1853 = fma(temp_1773, gsys_environment.data[68].z, temp_1800);
    // 0x003218: 0x59A0018000173403 Ffma
    temp_1854 = fma(temp_1755, temp_1768, temp_1845);
    // 0x003228: 0x59A0088001271717 Ffma
    temp_1855 = fma(temp_1847, temp_1837, temp_1840);
    // 0x003230: 0x59A0088001270813 Ffma
    temp_1856 = fma(temp_1849, temp_1837, temp_1840);
    // 0x003238: 0x59A0088001270A11 Ffma
    temp_1857 = fma(temp_1851, temp_1837, temp_1840);
    // 0x003248: 0x5C68100000C70D0C Fmul
    temp_1858 = temp_1852 * temp_1721;
    // 0x003250: 0x4C68102401671808 Fmul
    temp_1859 = temp_1838 * gsys_environment.data[5].z;
    // 0x003258: 0x4C68102401470B0D Fmul
    temp_1860 = temp_1735 * gsys_environment.data[5].x;
    // 0x003268: 0x4C68102401570B0A Fmul
    temp_1861 = temp_1735 * gsys_environment.data[5].y;
    // 0x003270: 0x4C68102401670B0B Fmul
    temp_1862 = temp_1735 * gsys_environment.data[5].z;
    // 0x003278: 0x4C68102401471818 Fmul
    temp_1863 = temp_1838 * gsys_environment.data[5].x;
    // 0x003288: 0x59A0000001671300 Ffma
    temp_1864 = fma(temp_1856, temp_1839, temp_1844);
    // 0x003290: 0x59A0040001671111 Ffma
    temp_1865 = fma(temp_1857, temp_1839, temp_1859);
    // 0x003298: 0x5C68140000D70C0D Fmul
    temp_1866 = temp_1858 * 0.25;
    temp_1867 = temp_1866 * temp_1860;
    // 0x0032A8: 0x5C68140000A70C0A Fmul
    temp_1868 = temp_1858 * 0.25;
    temp_1869 = temp_1868 * temp_1861;
    // 0x0032B0: 0x5C68100003570608 Fmul
    temp_1870 = temp_1753 * temp_1533;
    // 0x0032B8: 0x5C68140000B70C0C Fmul
    temp_1871 = temp_1858 * 0.25;
    temp_1872 = temp_1871 * temp_1862;
    // 0x0032C8: 0x5C6810000397060B Fmul
    temp_1873 = temp_1753 * temp_1534;
    // 0x0032D0: 0x59A00C0001671717 Ffma
    temp_1874 = fma(temp_1855, temp_1839, temp_1863);
    // 0x0032D8: 0x59A0068001B70404 Ffma
    temp_1875 = fma(temp_1536, temp_1704, temp_1867);
    // 0x0032E8: 0x59A0050001B70505 Ffma
    temp_1876 = fma(temp_1537, temp_1704, temp_1869);
    // 0x0032F0: 0x59A0010000170802 Ffma
    temp_1877 = fma(temp_1870, temp_1768, temp_1843);
    // 0x0032F8: 0x4C9807AC07F70008 Mov
    // 0x003308: 0x59A0070000170B0B Ffma
    temp_1878 = fma(temp_1873, temp_1768, temp_1853);
    // 0x003310: 0x59A0060001B71E1E Ffma
    temp_1879 = fma(temp_1538, temp_1704, temp_1872);
    // 0x003318: 0x59A0020002171704 Ffma
    temp_1880 = fma(temp_1874, temp_1099, temp_1875);
    // 0x003328: 0x59A0028000F70000 Ffma
    temp_1881 = fma(temp_1864, temp_1100, temp_1876);
    // 0x003330: 0x49A0012407970902 Ffma
    temp_1882 = fma(temp_1689, gsys_environment.data[30].y, temp_1877);
    // 0x003338: 0x49A001A407870901 Ffma
    temp_1883 = fma(temp_1689, gsys_environment.data[30].x, temp_1854);
    // 0x003348: 0x32A421BE80070803 Ffma
    temp_1884 = fma(gsys_material.data[31].w, 0.25, temp_474);
    temp_1885 = clamp(temp_1884, 0.0, 1.0);
    // 0x003350: 0x49A21EA40BE73D3D Ffma
    temp_1886 = 0.0 - temp_1834;
    temp_1887 = fma(temp_1834, gsys_environment.data[47].z, temp_1886);
    // 0x003358: 0x59A00F0002071111 Ffma
    temp_1888 = fma(temp_1865, temp_1101, temp_1879);
    // 0x003368: 0x49A005A407A70906 Ffma
    temp_1889 = fma(temp_1689, gsys_environment.data[30].z, temp_1878);
    // 0x003370: 0x59A0010000770000 Ffma
    temp_1890 = fma(temp_1881, temp_1789, temp_1882);
    // 0x003378: 0x59A0008000770401 Ffma
    temp_1891 = fma(temp_1880, temp_1789, temp_1883);
    // 0x003388: 0x0103E4CCCCD7F004 Mov32i
    // 0x003390: 0x59A0018003D70302 Ffma
    temp_1892 = fma(temp_1885, temp_1887, temp_1885);
    // 0x003398: 0x59A0030000771106 Ffma
    temp_1893 = fma(temp_1888, temp_1789, temp_1889);
    // 0x0033A8: 0x5C60178000170003 Fmnmx
    temp_1894 = max(temp_1890, temp_1891);
    // 0x0033B0: 0x49A0020401674343 Ffma
    temp_1895 = fma(temp_474, fp_c1.data[5].z, 0.200000003);
    // 0x0033B8: 0x5C60178000370603 Fmnmx
    temp_1896 = max(temp_1893, temp_1894);
    // 0x0033C8: 0x59A1008000370301 Ffma
    temp_1897 = 0.0 - temp_1896;
    temp_1898 = fma(temp_1896, temp_1897, temp_1891);
    // 0x0033D0: 0x5C6810000037030A Fmul
    temp_1899 = temp_1896 * temp_1896;
    // 0x0033D8: 0x59A1000000370304 Ffma
    temp_1900 = 0.0 - temp_1896;
    temp_1901 = fma(temp_1896, temp_1900, temp_1890);
    // 0x0033E8: 0x59A1030000370303 Ffma
    temp_1902 = 0.0 - temp_1896;
    temp_1903 = fma(temp_1896, temp_1902, temp_1893);
    // 0x0033F0: 0x59A0050004370100 Ffma
    temp_1904 = fma(temp_1898, temp_1895, temp_1899);
    // 0x0033F8: 0x59A0050004370401 Ffma
    temp_1905 = fma(temp_1901, temp_1895, temp_1899);
    // 0x003408: 0x59A0050004370303 Ffma
    temp_1906 = fma(temp_1903, temp_1895, temp_1899);
    // 0x003410: 0x5C68100000070200 Fmul
    temp_1907 = temp_1892 * temp_1904;
    // 0x003418: 0x5C68100000170201 Fmul
    temp_1908 = temp_1892 * temp_1905;
    // 0x003428: 0x5C68100000370202 Fmul
    temp_1909 = temp_1892 * temp_1906;
    // 0x003430: 0x0103F8000007F003 Mov32i
    // 0x003438: 0xE30000000007000F Exit
    out_color.x = temp_1907;
    out_color.y = temp_1908;
    out_color.z = temp_1909;
    out_color.w = 1.0;
    return;
}

