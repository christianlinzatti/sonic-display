export type AvatarRigProfileId = "auto" | "humanoid" | "mixamo" | "ready-player-me" | "robot";

export type AvatarRigProfile = {
  id: AvatarRigProfileId;
  label: string;
  aliases: Partial<Record<"head" | "neck" | "spine" | "chest" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg" | "leftFoot" | "rightFoot", RegExp[]>>;
  multipliers: { headNod: number; headTurn: number; spineSway: number; chestPulse: number; armSwing: number };
};

const humanoid = {
  head: [/^head$/i, /head/i], neck: [/^neck$/i, /neck/i], spine: [/^spine(?:0|1|2|3)?$/i, /spine/i], chest: [/^chest$/i, /upper.?chest/i, /chest/i],
  leftArm: [/left.*(upper)?arm/i, /(upper)?arm.*left/i, /l.?upper.?arm/i, /arm_l/i], rightArm: [/right.*(upper)?arm/i, /(upper)?arm.*right/i, /r.?upper.?arm/i, /arm_r/i],
  leftLeg: [/left.*(upper)?leg/i, /(upper)?leg.*left/i, /leftthigh/i, /thigh_l/i, /leg_l/i], rightLeg: [/right.*(upper)?leg/i, /(upper)?leg.*right/i, /rightthigh/i, /thigh_r/i, /leg_r/i],
  leftFoot: [/left.*(foot|ankle)/i, /(foot|ankle).*left/i, /foot_l/i], rightFoot: [/right.*(foot|ankle)/i, /(foot|ankle).*right/i, /foot_r/i],
};

export const avatarRigProfiles: AvatarRigProfile[] = [
  { id: "auto", label: "Auto detect", aliases: humanoid, multipliers: { headNod: 1, headTurn: 1, spineSway: 1, chestPulse: 1, armSwing: 1 } },
  { id: "humanoid", label: "Generic humanoid", aliases: humanoid, multipliers: { headNod: 1, headTurn: 1, spineSway: 1, chestPulse: 1, armSwing: 1 } },
  { id: "mixamo", label: "Mixamo", aliases: { head: [/^head$/i], neck: [/^neck$/i], spine: [/^spine$/i, /^spine1$/i, /^spine2$/i], chest: [/^spine2$/i], leftArm: [/^leftarm$/i], rightArm: [/^rightarm$/i], leftLeg: [/^leftupleg$/i], rightLeg: [/^rightupleg$/i], leftFoot: [/^leftfoot$/i], rightFoot: [/^rightfoot$/i] }, multipliers: { headNod: 1.1, headTurn: .9, spineSway: .85, chestPulse: 1.15, armSwing: 1.2 } },
  { id: "ready-player-me", label: "Ready Player Me", aliases: { head: [/^head$/i], neck: [/^neck$/i], spine: [/^spine$/i], chest: [/^spine1$/i, /^chest$/i], leftArm: [/^leftarm$/i], rightArm: [/^rightarm$/i], leftLeg: [/^leftupleg$/i, /^leftleg$/i], rightLeg: [/^rightupleg$/i, /^rightleg$/i], leftFoot: [/^leftfoot$/i], rightFoot: [/^rightfoot$/i] }, multipliers: { headNod: .9, headTurn: .8, spineSway: 1, chestPulse: .8, armSwing: .9 } },
  { id: "robot", label: "Robot / mechanical", aliases: { head: [/head|skull/i], neck: [/neck/i], spine: [/spine|body|torso/i], chest: [/chest|torso/i], leftArm: [/left.*arm|arm.*left|l_arm/i], rightArm: [/right.*arm|arm.*right|r_arm/i], leftLeg: [/left.*leg|leg.*left|l_leg|leftthigh/i], rightLeg: [/right.*leg|leg.*right|r_leg|rightthigh/i], leftFoot: [/left.*foot|foot.*left|l_foot/i], rightFoot: [/right.*foot|foot.*right|r_foot/i] }, multipliers: { headNod: .65, headTurn: .55, spineSway: .7, chestPulse: 1.45, armSwing: 1.35 } },
];

export function getAvatarRigProfile(id?: AvatarRigProfileId) { return avatarRigProfiles.find(profile => profile.id === id) ?? avatarRigProfiles[0]; }
