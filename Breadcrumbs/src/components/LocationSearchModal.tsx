import React, { useState } from "react";
import List from "../components/List";
import "material/textfield/outlined-text-field";

interface SearchResult {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchModalProps<T extends SearchResult> {
  onSearch: (searchQuery: string) => Promise<T[]>; // Ensure it returns a Promise of flexible results
  onClickResult: (selectedResult: T) => void; // Now accepts any kind of SearchResult
  renderResult?: (result: T) => React.ReactNode;
  placeholderText: string;
  buttonText: string;
  clickText: string;
}

const LocationSearchModal = <T extends SearchResult>({
  onSearch,
  onClickResult,
  renderResult,
  placeholderText,
  buttonText,
  clickText,
}: SearchModalProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<T[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div className="search-modal">
      <form onSubmit={handleSearch}>
        <md-outlined-text-field
          label="location search"
          // value="Enter Location"
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e); // Trigger form submission
            }
          }}
        ></md-outlined-text-field>
      </form>
      {searchResults.length > 0 && (
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginTop: "12px",
            padding: "4px",
          }}
        >
          <List
            items={searchResults.map((result) => ({
              text: result.name,
              onClickButton: () => onClickResult(result),
              buttonText: clickText,
            }))}
          />
        </div>
      )}
    </div>
  );
};

export default LocationSearchModal;
