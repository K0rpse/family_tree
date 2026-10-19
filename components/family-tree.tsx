"use client";

import BalkanFamilyTree from "@balkangraph/familytree.js";
import { useEffect, useRef, useState } from "react";
import type { FamilyConfig, FamilyMember } from "../types/family";

type FamilySearchResult = {
  id: number | string;
  name: string;
};

const MAX_SEARCH_RESULTS = 8;

export function FamilyTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<BalkanFamilyTree | null>(null);
  const searchQueryRef = useRef("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FamilySearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [treeReady, setTreeReady] = useState(false);

  function updateResults(value: string, activeTree = treeRef.current) {
    const searchTerm = value.trim();

    if (!activeTree || searchTerm.length < 2) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    const matches = activeTree.search(searchTerm, ["name"], ["name"]);
    setTotalResults(matches.length);
    setResults(matches.slice(0, MAX_SEARCH_RESULTS));
  }

  function handleSearchChange(value: string) {
    searchQueryRef.current = value;
    setQuery(value);
    setShowResults(true);
    updateResults(value);
  }

  function selectPerson(person: FamilySearchResult) {
    const activeTree = treeRef.current;
    if (!activeTree) return;

    activeTree.center(person.id);
    setQuery(person.name);
    searchQueryRef.current = person.name;
    setResults([]);
    setShowResults(false);
  }

  function clearSearch() {
    searchQueryRef.current = "";
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

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
      treeRef.current = tree;
      setTreeReady(true);
      updateResults(searchQueryRef.current, tree);
    }

    loadFamily().catch((error) => console.error("Family tree initialization failed:", error));

    return () => {
      cancelled = true;
      treeRef.current = null;
      tree?.destroy();
    };
  }, []);

  const normalizedQuery = query.trim();

  return (
    <>
      <section className="family-search" aria-label="Recherche dans l'arbre généalogique">
        <form
          className="family-search__form"
          onSubmit={(event) => {
            event.preventDefault();
            if (results[0]) selectPerson(results[0]);
          }}
        >
          <label className="family-search__label" htmlFor="family-name-search">
            Rechercher une personne
          </label>
          <div className="family-search__input-row">
            <span className="family-search__icon" aria-hidden="true">
              ⌕
            </span>
            <input
              id="family-name-search"
              className="family-search__input"
              type="search"
              value={query}
              onChange={(event) => handleSearchChange(event.currentTarget.value)}
              onFocus={() => {
                if (normalizedQuery) setShowResults(true);
              }}
              placeholder="Saisir un nom…"
              autoComplete="off"
              aria-controls="family-search-results"
              aria-expanded={showResults && normalizedQuery.length > 0}
            />
            {query && (
              <button
                className="family-search__clear"
                type="button"
                onClick={clearSearch}
                aria-label="Effacer la recherche"
                title="Effacer"
              >
                ×
              </button>
            )}
          </div>
        </form>

        {showResults && normalizedQuery.length > 0 && (
          <div
            className="family-search__results"
            id="family-search-results"
            aria-live="polite"
          >
            {normalizedQuery.length < 2 ? (
              <p className="family-search__message">Saisis au moins 2 caractères.</p>
            ) : !treeReady ? (
              <p className="family-search__message">Chargement de l’arbre…</p>
            ) : results.length === 0 ? (
              <p className="family-search__message">Aucune personne trouvée.</p>
            ) : (
              <>
                <p className="family-search__count">
                  {totalResults === 1
                    ? "1 personne trouvée"
                    : `${totalResults} personnes trouvées`}
                </p>
                <ul className="family-search__list">
                  {results.map((person) => (
                    <li key={person.id}>
                      <button
                        type="button"
                        className="family-search__result"
                        onClick={() => selectPerson(person)}
                      >
                        <span className="family-search__person-icon" aria-hidden="true">
                          ◉
                        </span>
                        <span>{person.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {totalResults > MAX_SEARCH_RESULTS && (
                  <p className="family-search__hint">
                    Affichage des {MAX_SEARCH_RESULTS} premiers résultats. Précise le nom pour affiner.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <div ref={containerRef} className="family-tree" />
    </>
  );
}
