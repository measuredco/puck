import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("ExternalInput", styles);

export const ExternalInput = ({
  field,
  onChange,
}: {
  field: any;
  onChange: any;
}) => {
  const [data, setData] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    (async () => {
      setData(await field.adaptor.fetchList(field.adaptorParams));
    })();
  }, [field.adaptor, field.adaptorParams]);

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
          {selectedData
            ? selectedData.attributes.title
            : `Select from ${field.adaptor.name}`}
        </button>
        {selectedData && (
          <button
            className={getClassName("detachButton")}
            onClick={() => {
              setSelectedData(null);
              onChange({ currentTarget: { value: null } });
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
                  {Object.keys(data[0].attributes).map((key) => (
                    <th key={key} style={{ textAlign: "left" }}>
                      {key}
                    </th>
                  ))}
                </thead>
                <tbody>
                  {data.map((item) => {
                    return (
                      <tr
                        key={item.id}
                        style={{ whiteSpace: "nowrap" }}
                        onClick={(e) => {
                          onChange({
                            ...e,
                            // This is a dirty hack until we have a proper form lib
                            currentTarget: {
                              ...e.currentTarget,
                              value: item,
                            },
                          });

                          setOpen(false);

                          setSelectedData(item);
                        }}
                      >
                        {Object.keys(item.attributes).map((key) => (
                          <td key={key}>{item.attributes[key]}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No content</div>
          )}
        </div>
      </div>
    </div>
  );
};
