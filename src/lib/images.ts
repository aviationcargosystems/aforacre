// Unsplash CDN image helper. All photo IDs are verified (HTTP 200) — see
// public/unsplash/_credits.json for attribution. Mode A (CDN URLs): images are
// requested at a slot-appropriate size via Unsplash's on-the-fly resize params.

function unsplash(id: string, w: number, q = 75) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

// Raw photo IDs grouped by theme, sourced from the searches run for this project.
export const PHOTO_IDS: Record<string, string[]> = {
  polyhouse: ["1752608277943-e2f36ab66c34"],
  greenhouseConstruction: [
    "1678536330795-e0b73dba51ee",
    "1508858344364-19ec6c221e0b",
    "1762512216828-8dd5657004b6",
    "1477519848980-7060025f5aff",
  ],
  commercialFarming: [
    "1736664122955-e35a73319de9",
    "1774695475379-88e1351e4922",
    "1681226298721-88cdb4096e5f",
    "1642863742743-2ea2915cacd0",
  ],
  retirementFarmhouse: [
    "1642227671308-31f0d6f275f1",
    "1741541149020-02dbb11ebd37",
    "1767884163937-38bd5fa692cf",
    "1544714907-7b704cb5fe0e",
  ],
  getawayCabin: [
    "1693713354781-fc9921f17141",
    "1606145905507-687a265c7c58",
    "1709389137226-f94058d3cbe7",
    "1779997337884-8b413c5df7c0",
  ],
  southIndiaFarmland: [
    "1694011772133-dc4b3ff3f24f",
    "1595433306946-233f47e4af3a",
    "1652820330042-92a30b18abc5",
    "1723155781081-a9a6f34e3fe0",
  ],
  redSoilFarmland: [
    "1621857913524-37fee58633bd",
    "1570723492663-7fb2be25db16",
    "1777500917077-ddc6e039b8f6",
  ],
  solar: [
    "1558449028-b53a39d100fc",
    "1497435334941-8c899ee9e8e9",
    "1629726797843-618688139f5a",
    "1589201529153-5297335c1684",
  ],
  irrigation: [
    "1738598665698-7fd7af4b5e0c",
    "1640677117376-573b9dbb8ea8",
    "1594854095538-9e6ba14a0eff",
    "1666082187762-e963df0f9f05",
  ],
  borewell: [
    "1562237553-36ad661d6f2c",
    "1562237553-fd52cb2067b6",
    "1562237548-3c36707230ce",
    "1675060968740-1a459ae4420b",
  ],
  soilTesting: [
    "1560493676-04071c5f467b",
    "1557234195-bd9f290f0e4d",
    "1586771107445-d3ca888129ff",
    "1618212624319-3cd9681707e2",
  ],
  fencing: [
    "1537407034356-b8f5f1ac2aa8",
    "1586574208875-cd77c2bfb851",
    "1515524042669-de726ea3283d",
    "1645791498650-2509fad63992",
  ],
  farmManagement: [
    "1594771804886-a933bb2d609b",
    "1615811361523-6bd03d7748e7",
    "1614977645540-7abd88ba8e56",
    "1606739211185-2c846d734a6d",
  ],
  landscaping: [
    "1597201278257-3687be27d954",
    "1668120089662-42642838cfef",
    "1700689807667-82630348b301",
    "1632161293871-cf2083474e34",
  ],
  legal: [
    "1603796846097-bee99e4a601f",
    "1450101499163-c8848c66ca85",
    "1521791055366-0d553872125f",
    "1635859890085-ec8cb5466806",
  ],
  headshotMen: [
    "1778692258270-bc0e80e975c0",
    "1632999872777-c233e9a6b471",
    "1656221009909-4f202547cd94",
    "1656221010175-bcfeadcb6017",
  ],
  headshotWomen: [
    "1646979201169-e83d743bfa8d",
    "1706943262459-3ef6ce03305c",
    "1768221677463-191fc4e15690",
    "1533128361669-69c065857a13",
  ],
  villageRoad: [
    "1651678938586-affccc71c270",
    "1634874706682-3468a6e421ba",
    "1600100397849-3a782cfd8492",
    "1623059190081-3045101c6498",
  ],
};

export function heroImg(id: string) {
  return unsplash(id, 1600, 75);
}
export function cardImg(id: string) {
  return unsplash(id, 800, 70);
}
export function galleryImg(id: string) {
  return unsplash(id, 1200, 78);
}
export function thumbImg(id: string) {
  return unsplash(id, 400, 70);
}
export function avatarImg(id: string) {
  return unsplash(id, 200, 75);
}

// Round-robin picker so callers can deterministically cycle a themed pool
// across N items without repeats until the pool is exhausted.
export function pick<T>(pool: readonly T[], index: number): T {
  return pool[index % pool.length];
}
