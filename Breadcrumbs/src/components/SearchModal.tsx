import React, { useState } from "react";
import List from "../components/List";
import "material/textfield/outlined-text-field";

interface SearchResult {
  id: string;
  display_name: string;
  email?: string;
}

interface RequestStatus {
  userId: string;
  message: string;
  type: "success" | "error";
}

interface SearchModalProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onClickResult: (id: string) => void;
  placeholderText: string;
  buttonText: string;
  clickText: string;
  isRequestPending?: (id: string) => boolean;
  requestStatus?: RequestStatus | null;
}

export default function SearchModal({
  onSearch,
  onClickResult,
  placeholderText,
  buttonText,
  clickText,
  isRequestPending,
  requestStatus,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
      setSearchError(
        results.length === 0 ? "No results found. Try a different query." : null
      );
    } catch (error) {
      console.error("Error during search:", error);
      setSearchError("An error occurred while searching. Please try again.");
    }
  };

  return (
    <div className="search-modal-green">
      <form onSubmit={handleSearch} className="search-form">
        <md-outlined-text-field
          label={placeholderText}
          value={searchQuery}
          onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e);
            }
          }}
        ></md-outlined-text-field>
      </form>

      {searchError && <p className="search-error">{searchError}</p>}

      {requestStatus && (
        <div className={`request-status ${requestStatus.type}`}>
          {requestStatus.message}
        </div>
      )}

      <div className="search-results">
        <div className="info">Selected: {currentName}</div>
        <List
          items={searchResults.map((result) => {
            const isPending = isRequestPending
              ? isRequestPending(result.id)
              : false;
            const isCurrent = requestStatus?.userId === result.id;

            return {
              text: (
                <div className="result-info">
                  <div className="result-name">{result.display_name}</div>
                  {result.email && (
                    <div
                      className="result-email"
                      style={{ fontSize: "0.9em", opacity: 0.8 }}
                    >
                      {result.email}
                    </div>
                  )}
                </div>
              ),
              onClickButton: () => {
                onClickResult(result.id);
                setCurrentName(result.display_name);
                if (!isCurrent) {
                  // setSearchResults([]);
                  // setSearchQuery("");
                }
              },
              buttonText: isPending ? "Sending..." : clickText,
              buttonDisabled: isPending,
            };
          })}
        />
      </div>
    </div>
  );
}
