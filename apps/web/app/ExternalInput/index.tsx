import { useEffect, useState } from "react";

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
    <div>
      <div style={{ display: "flex" }}>
        <button onClick={() => setOpen(true)}>
          {selectedData
            ? `${field.adaptor.name}: ${selectedData.attributes.title}`
            : `Select from ${field.adaptor.name}`}
        </button>
        {selectedData && (
          <button
            onClick={() => {
              setSelectedData(null);
              onChange({ currentTarget: { value: null } });
            }}
          >
            Detach
          </button>
        )}
      </div>
      <div
        style={{
          background: "#00000080",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: isOpen ? "flex" : "none",
          zIndex: 1,
        }}
        onClick={() => setOpen(false)}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1024,
            padding: 32,
            borderRadius: 32,
            overflow: "hidden",
            background: "white",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Select content</h2>

          {data.length ? (
            <div style={{ overflowX: "scroll" }}>
              <table cellPadding="8" cellSpacing="8">
                <tr>
                  {Object.keys(data[0].attributes).map((key) => (
                    <th key={key} style={{ textAlign: "left" }}>
                      {key}
                    </th>
                  ))}
                </tr>
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
