import { DefaultRootProps, DropZone } from "@/core";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

export type RootProps = DefaultRootProps;

function Root({ puck }: RootProps) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header editMode={puck.isEditing} />
      <DropZone zone="default-zone" style={{ flexGrow: 1 }} />
      <Footer>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
      </Footer>
    </div>
  );
}

export default Root;
