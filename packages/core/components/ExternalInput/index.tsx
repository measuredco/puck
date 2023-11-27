import { useMemo, useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { ExternalField } from "../../types/Config";
import { Link, Search, Unlock } from "react-feather";
import { Modal } from "../Modal";
import { Heading } from "../Heading";
import { ClipLoader } from "react-spinners";
import { Button } from "../Button";

const getClassName = getClassNameFactory("ExternalInput", styles);
const getClassNameModal = getClassNameFactory("ExternalInputModal", styles);

const dataCache: Record<string, any> = {};

export const ExternalInput = ({
  field,
  onChange,
  value = null,
  name,
  id,
}: {
  field: ExternalField;
  onChange: (value: any) => void;
  value: any;
  name: string;
  id: string;
}) => {
  const { mapProp = (val) => val } = field || {};

  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const keys = useMemo(() => {
    const validKeys: Set<string> = new Set();

    for (const item of data) {
      for (const key of Object.keys(item)) {
        if (typeof item[key] === "string" || typeof item[key] === "number") {
          validKeys.add(key);
        }
      }
    }

    return Array.from(validKeys);
  }, [data]);

  const [searchQuery, setSearchQuery] = useState(field.initialQuery || "");

  const search = useCallback(
    async (query) => {
      setIsLoading(true);

      const cacheKey = `${id}-${name}-${query}`;

      const listData =
        dataCache[cacheKey] || (await field.fetchList({ query }));

      if (listData) {
        setData(listData);
        setIsLoading(false);

        dataCache[cacheKey] = listData;
      }
    },
    [name, field]
  );

  useEffect(() => {
    search(searchQuery);
  }, []);

  return (
    <div
      className={getClassName({
        dataSelected: !!value,
        modalVisible: isOpen,
      })}
      id={id}
    >
      <div className={getClassName("actions")}>
        <button
          onClick={() => setOpen(true)}
          className={getClassName("button")}
        >
          {/* NB this is hardcoded to strapi for now */}
          {value ? (
            field.getItemSummary ? (
              field.getItemSummary(value)
            ) : (
              "External item"
            )
          ) : (
            <>
              <Link size="16" />
              <span>{field.placeholder}</span>
            </>
          )}
        </button>
        {value && (
          <button
            className={getClassName("detachButton")}
            onClick={() => {
              onChange(null);
            }}
          >
            <Unlock size={16} />
          </button>
        )}
      </div>
      <Modal onClose={() => setOpen(false)} isOpen={isOpen}>
        <div
          className={getClassNameModal({
            isLoading,
            loaded: !isLoading,
            hasData: data.length > 0,
          })}
        >
          <div className={getClassNameModal("masthead")}>
            <Heading rank={2} size="xxl">
              Select content
            </Heading>

            {field.showSearch && (
              <form
                className={getClassNameModal("searchForm")}
                onSubmit={(e) => {
                  e.preventDefault();

                  search(searchQuery);
                }}
              >
                <label className={getClassNameModal("search")}>
                  <span className={getClassNameModal("searchIconText")}>
                    Search
                  </span>
                  <div className={getClassNameModal("searchIcon")}>
                    <Search size="18" />
                  </div>
                  <input
                    className={getClassNameModal("searchInput")}
                    name="q"
                    type="search"
                    placeholder="Search"
                    onChange={(e) => {
                      setSearchQuery(e.currentTarget.value);
                    }}
                    autoComplete="off"
                    value={searchQuery}
                  ></input>
                </label>
                <Button type="submit" loading={isLoading} disabled={isLoading}>
                  Search
                </Button>
              </form>
            )}
          </div>

          <div className={getClassNameModal("tableWrapper")}>
            <table className={getClassNameModal("table")}>
              <thead className={getClassNameModal("thead")}>
                <tr className={getClassNameModal("tr")}>
                  {keys.map((key) => (
                    <th
                      key={key}
                      className={getClassNameModal("th")}
                      style={{ textAlign: "left" }}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={getClassNameModal("tbody")}>
                {data.map((item, i) => {
                  return (
                    <tr
                      key={i}
                      style={{ whiteSpace: "nowrap" }}
                      className={getClassNameModal("tr")}
                      onClick={(e) => {
                        onChange(mapProp(item));

                        setOpen(false);
                      }}
                    >
                      {keys.map((key) => (
                        <td key={key} className={getClassNameModal("td")}>
                          {item[key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className={getClassNameModal("loadingBanner")}>
              <ClipLoader size={24} aria-label="Loading" />
            </div>
          </div>

          <div className={getClassNameModal("noContentBanner")}>
            No results.
          </div>
        </div>
      </Modal>
    </div>
  );
};
