export default async function Page() {
  return (
    <div className="Page">
      <h1 className="">Puck demo</h1>
      <h2>Choose a demo framework</h2>
      <div className="Frameworks">
        <a className="Framework" href="/antd/edit">
          Ant Design
        </a>
        <a className="Framework" href="/material-ui/edit">
          Material UI
        </a>
      </div>
    </div>
  );
}
