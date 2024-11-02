import { DefaultRootProps, DropZone } from "@/core";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

export type RootProps = DefaultRootProps;

function Root({ children, puck }: RootProps) {
  return (
    <>
      <Header editMode={puck.isEditing} />
      <DropZone zone={"default-zone"} disallow={["GridItem"]} />
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
    </>
  );
}

export default Root;
