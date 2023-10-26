import { useMemo, useEffect, useState } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { ExternalField } from "../../types/Config";
import { Link, Unlock } from "react-feather";
import { Modal } from "../Modal";
import { Heading } from "../Heading";

const getClassName = getClassNameFactory("ExternalInput", styles);

export const ExternalInput = ({
  field,
  onChange,
  value = null,
}: {
  field: ExternalField;
  onChange: (value: any) => void;
  value: any;
}) => {
  const { mapProp = (val) => val } = field.adaptor || {};

  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(value);
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
      if (field.adaptor) {
        const listData = await field.adaptor.fetchList(field.adaptorParams);

        if (listData) {
          setData(listData);
        }
      }
    })();
  }, [field.adaptor, field.adaptorParams]);

  if (!field.adaptor) {
    return <div>Incorrectly configured</div>;
  }

  return (
    <div
      className={getClassName({
        hasData: !!selectedData,
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
              `${field.adaptor.name} item`
            )
          ) : (
            <>
              <Link size="16" />
              <span>Select from {field.adaptor.name}</span>
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
        <div className={getClassName("masthead")}>
          <Heading rank={2} size="xxl">
            Select content
          </Heading>
        </div>

        {data.length ? (
          <div className={getClassName("modalTableWrapper")}>
            <table className={getClassName("table")}>
              <thead>
                <tr>
                  {keys.map((key) => (
                    <th key={key} style={{ textAlign: "left" }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  return (
                    <tr
                      key={i}
                      style={{ whiteSpace: "nowrap" }}
                      onClick={(e) => {
                        onChange(mapProp(item));

                        setOpen(false);

                        setSelectedData(mapProp(item));
                      }}
                    >
                      {keys.map((key) => (
                        <td key={key}>{item[key]}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 24 }}>No content</div>
        )}
      </Modal>
    </div>
  );
};
