"use client";

import BalkanFamilyTree from "@balkangraph/familytree.js";
import { useEffect, useRef } from "react";
import type { FamilyConfig, FamilyMember } from "../types/family";

export function FamilyTree() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let tree: BalkanFamilyTree | undefined;
    let cancelled = false;

    async function loadFamily() {
      const [familyResponse, configResponse] = await Promise.all([
        fetch("/family-data/family.json"),
        fetch("/family-data/config.json"),
      ]);
      if (!familyResponse.ok) {
        throw new Error(`Unable to load family data (${familyResponse.status})`);
      }
      if (!configResponse.ok) {
        throw new Error(`Unable to load family configuration (${configResponse.status})`);
      }

      const privateNodes = (await familyResponse.json()) as FamilyMember[];
      const config = (await configResponse.json()) as FamilyConfig;
      const nodes = privateNodes.map((member) => ({
        ...member,
        img: member.img.startsWith("img/")
          ? `/family-data/images/${member.img.slice(4)}`
          : member.img,
      }));

      if (cancelled || !containerRef.current) return;

      tree = new BalkanFamilyTree(containerRef.current, {
        nodes,
        roots: config.roots,
        mode: config.mode,
        template: config.template,
        nodeBinding: {
          field_0: "name",
          img_0: "img",
        },
      });
    }

    loadFamily().catch((error) => console.error("Family tree initialization failed:", error));

    return () => {
      cancelled = true;
      tree?.destroy();
    };
  }, []);

  return <div ref={containerRef} className="family-tree" />;
}
