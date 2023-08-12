import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Field } from "../../types/Config";
import { Link } from "react-feather";

const getClassName = getClassNameFactory("ExternalInput", styles);

export const ExternalInput = ({
  field,
  onChange,
  value = null,
}: {
  field: Field;
  onChange: (value: any) => void;
  value: any;
}) => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(value);

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
            Detach
          </button>
        )}
      </div>
      <div className={getClassName("modal")} onClick={() => setOpen(false)}>
        <div
          className={getClassName("modalInner")}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className={getClassName("modalHeading")}>Select content</h2>

          {data.length ? (
            <div className={getClassName("modalTableWrapper")}>
              <table>
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
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
                          onChange(item);

                          setOpen(false);

                          setSelectedData(item);
                        }}
                      >
                        {Object.keys(item).map((key) => (
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
        </div>
      </div>
    </div>
  );
};
