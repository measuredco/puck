import { useMemo, useEffect, useState, useCallback } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { ExternalField } from "../../types/Config";
import { Link, Search, SlidersHorizontal, Unlock } from "lucide-react";
import { Modal } from "../Modal";
import { Heading } from "../Heading";
import { ClipLoader } from "react-spinners";
import { Button } from "../Button";
import { InputOrGroup } from "../InputOrGroup";
import { IconButton } from "../IconButton";

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
  const {
    mapProp = (val) => val,
    mapRow = (val) => val,
    filterFields,
  } = field || {};

  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hasFilterFields = !!filterFields;

  const [filters, setFilters] = useState(field.initialFilters || {});
  const [filtersToggled, setFiltersToggled] = useState(hasFilterFields);

  const mappedData = useMemo(() => {
    return data.map(mapRow);
  }, [data]);

  const keys = useMemo(() => {
    const validKeys: Set<string> = new Set();

    for (const item of mappedData) {
      for (const key of Object.keys(item)) {
        if (typeof item[key] === "string" || typeof item[key] === "number") {
          validKeys.add(key);
        }
      }
    }

    return Array.from(validKeys);
  }, [mappedData]);

  const [searchQuery, setSearchQuery] = useState(field.initialQuery || "");

  const search = useCallback(
    async (query, filters) => {
      setIsLoading(true);

      const cacheKey = `${id}-${query}-${JSON.stringify(filters)}`;

      const listData =
        dataCache[cacheKey] || (await field.fetchList({ query, filters }));

      if (listData) {
        setData(listData);
        setIsLoading(false);

        dataCache[cacheKey] = listData;
      }
    },
    [name, field]
  );

  useEffect(() => {
    search(searchQuery, filters);
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
          type="button"
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
        <form
          className={getClassNameModal({
            isLoading,
            loaded: !isLoading,
            hasData: mappedData.length > 0,
            filtersToggled,
          })}
          onSubmit={(e) => {
            e.preventDefault();

            search(searchQuery, filters);
          }}
        >
          <div className={getClassNameModal("masthead")}>
            {field.showSearch ? (
              <div className={getClassNameModal("searchForm")}>
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
                    placeholder={field.placeholder}
                    onChange={(e) => {
                      setSearchQuery(e.currentTarget.value);
                    }}
                    autoComplete="off"
                    value={searchQuery}
                  ></input>
                </label>
                <div className={getClassNameModal("searchActions")}>
                  <Button type="submit" loading={isLoading} fullWidth>
                    Search
                  </Button>
                  {hasFilterFields && (
                    <div className={getClassNameModal("searchActionIcon")}>
                      <IconButton
                        title="Toggle filters"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFiltersToggled(!filtersToggled);
                        }}
                      >
                        <SlidersHorizontal size={20} />
                      </IconButton>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Heading rank={2} size="xs">
                {field.placeholder || "Select data"}
              </Heading>
            )}
          </div>

          <div className={getClassNameModal("grid")}>
            {hasFilterFields && (
              <div className={getClassNameModal("filters")}>
                {hasFilterFields &&
                  Object.keys(filterFields).map((fieldName) => {
                    const filterField = filterFields[fieldName];
                    return (
                      <InputOrGroup
                        key={fieldName}
                        field={filterField}
                        name={fieldName}
                        id={`external_field_${fieldName}_filter`}
                        label={filterField.label || fieldName}
                        value={filters[fieldName]}
                        onChange={(value) => {
                          const newFilters = { ...filters, [fieldName]: value };

                          setFilters(newFilters);

                          search(searchQuery, newFilters);
                        }}
                      />
                    );
                  })}
              </div>
            )}

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
                  {mappedData.map((item, i) => {
                    return (
                      <tr
                        key={i}
                        style={{ whiteSpace: "nowrap" }}
                        className={getClassNameModal("tr")}
                        onClick={() => {
                          onChange(mapProp(data[i]));

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
          </div>

          <div className={getClassNameModal("footer")}>
            {mappedData.length} result{mappedData.length === 1 ? "" : "s"}
          </div>
        </form>
      </Modal>
    </div>
  );
};
