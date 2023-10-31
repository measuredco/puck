import { useMemo, useEffect, useState } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { ExternalField } from "../../types/Config";
import { Link, Unlock } from "react-feather";
import { Modal } from "../Modal";
import { Heading } from "../Heading";
import { ClipLoader } from "react-spinners";

const getClassName = getClassNameFactory("ExternalInput", styles);
const getClassNameModal = getClassNameFactory("ExternalInputModal", styles);

export const ExternalInput = ({
  field,
  onChange,
  value = null,
}: {
  field: ExternalField;
  onChange: (value: any) => void;
  value: any;
}) => {
  const { mapProp = (val) => val } = field || {};

  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(value);
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

  useEffect(() => {
    (async () => {
      const listData = await field.fetchList();

      if (listData) {
        setData(listData);
        setIsLoading(false);
      }
    })();
  }, [field]);

  return (
    <div
      className={getClassName({
        dataSelected: !!selectedData,
        modalVisible: isOpen,
      })}
    >
      <div className={getClassName("actions")}>
        <button
          onClick={() => setOpen(true)}
          className={getClassName("button")}
        >
          {/* NB this is hardcoded to strapi for now */}
          {selectedData ? (
            field.getItemSummary ? (
              field.getItemSummary(selectedData)
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
        {selectedData && (
          <button
            className={getClassName("detachButton")}
            onClick={() => {
              setSelectedData(null);
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
            hasData: !!data,
          })}
        >
          <div className={getClassNameModal("masthead")}>
            <Heading rank={2} size="xxl">
              Select content
            </Heading>
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

                        setSelectedData(mapProp(item));
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
          </div>

          <div className={getClassNameModal("noContentBanner")}>No content</div>

          <div className={getClassNameModal("loadingBanner")}>
            <ClipLoader size="24" />
          </div>
        </div>
      </Modal>
    </div>
  );
};
