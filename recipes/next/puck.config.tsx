import {
  Align,
  Base,
  Button,
  Card,
  Columns,
  Curve,
  Elevation,
  Group,
  Heading,
  Icon,
  Image,
  Poster,
  Section,
  SiteHeader,
  SiteFooter,
  Surface,
  Text,
  UniversalHeader,
  VerticalSpace,
} from "@arc-ui/components";
import { backgrounds as surfaceBackgrounds } from "@arc-ui/components/dist/Surface";
import { Config, Data } from "@puck/core/types/Config";
import strapiAdaptor from "@puck/adaptor-strapi";

const curveSizes = ["s", "m", "l"];
const curvePositions = [
  "bottom",
  "bottomLeft",
  "bottomRight",
  "top",
  "topLeft",
  "topRight",
];

type Props = {
  UniversalHeader: { links: { href: string; label: string }[] };
  SiteFooter: { surface: (typeof surfaceBackgrounds)[number] };
  Hero: {
    _data: object;
    description: string;
    title: string;
    imageUrl: string;
    proposition?: string;
    primaryCtaHref?: string;
    primaryCtaLabel?: string;
    secondaryCtaHref?: string;
    secondaryCtaLabel?: string;
    header: "off" | "on";
    curve: "off" | "on";
    curveSize: (typeof curveSizes)[number]; // TODO this isn't working for some reason
    curveFrom: (typeof curvePositions)[number];
    curveBottomColor: (typeof surfaceBackgrounds)[number];
  };
  Details: {
    body: string;
    heading: string;
    ctaHref?: string;
    ctaLabel?: string;
    surface: (typeof surfaceBackgrounds)[number];
    imageSide: "left" | "right";
  };
  "Card Deck": { surface: (typeof surfaceBackgrounds)[number] };
  Curve: {
    size: (typeof curveSizes)[number]; // TODO this isn't working for some reason
    from: (typeof curvePositions)[number];
    bottomColor: (typeof surfaceBackgrounds)[number];
    topColor: (typeof surfaceBackgrounds)[number];
  };
};

export const config: Config<Props> = {
  page: {
    fields: {
      title: {
        type: "text",
      },
    },
    render: ({ children }) => <Base>{children}</Base>,
  },
  components: {
    Hero: {
      fields: {
        _data: {
          type: "external",
          adaptor: strapiAdaptor,
          adaptorParams: {
            // Not a real API token
            apiToken:
              "76ef70c739ec2fe718bfff35fa64384f1ada1d11ca83e3deb432e23304dfddbbe295f785d7c6fe7985a0e7f138633edf8c8a4eb1c4208cd5734f3220c19c0736567a5d3cacc20bba37a1e7fbc9e83ce0e808ce8ad1055f10d3f1eec4a42f378521df8dd12f839930382d18bda55def0615d3ea2d5fdef5196406695c13c44102",
            resource: "movies",
          },
        },
        // TODO assume this input type as default
        title: { type: "text" },
        proposition: { type: "text" },
        imageUrl: { type: "text" },
        description: { type: "text" },
        primaryCtaLabel: { type: "text" },
        primaryCtaHref: { type: "text" },
        secondaryCtaLabel: { type: "text" },
        secondaryCtaHref: { type: "text" },
        header: {
          type: "select",
          options: [
            { label: "on", value: "on" },
            { label: "off", value: "off" },
          ],
        },
        curve: {
          type: "select",
          options: [
            { label: "off", value: "off" },
            { label: "on", value: "on" },
          ],
        },
        curveSize: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...curveSizes.map((size) => ({
              label: size.toUpperCase(),
              value: size,
            })),
          ],
        },
        curveFrom: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...curvePositions.map((from) => ({ label: from, value: from })),
          ],
        },
        curveBottomColor: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...surfaceBackgrounds.map((bg) => ({ label: bg, value: bg })),
          ],
        },
      },
      render: ({
        title = "Title",
        proposition,
        description = "Description",
        primaryCtaHref = "#",
        primaryCtaLabel = "Click me",
        secondaryCtaHref = "#",
        secondaryCtaLabel = "Click me",
        imageUrl,
        header = "on",
        curve,
        curveSize = "s",
        curveFrom = "topRight",
        curveBottomColor = "white",
      }) => (
        <Poster background={<Poster.Image src={imageUrl} />}>
          {header === "on" && (
            <SiteHeader
              isTransparent
              search={<Icon icon="btSearch" label="Search" size={24} />}
            >
              <SiteHeader.NavItem
                href="/products"
                title="Products & solutions"
                viewAllTitle="All products & solutions"
              />
              <SiteHeader.NavItem
                href="/why-choose-bt"
                title="Why choose BT?"
                viewAllTitle="Learn more about BT Business"
              ></SiteHeader.NavItem>
              <SiteHeader.NavItem
                href="/help"
                title="Help & support"
                viewAllTitle="Get help & support"
              ></SiteHeader.NavItem>
            </SiteHeader>
          )}
          <Section>
            <VerticalSpace size="96" />
            <Columns>
              <Columns.Col spanM={5}>
                <Align vertical="center">
                  <Heading level="1" size="xl">
                    {title}
                    <Heading.Proposition>{proposition}</Heading.Proposition>
                  </Heading>
                  <VerticalSpace size="12" />
                  <Text size="l">{description}</Text>
                  <VerticalSpace size="32" />
                  <Group>
                    {secondaryCtaHref && (
                      <Group.Item>
                        <Button
                          fill="outlined"
                          label={secondaryCtaLabel}
                          href={secondaryCtaHref}
                        />
                      </Group.Item>
                    )}
                    {primaryCtaHref && (
                      <Group.Item>
                        <Elevation>
                          <Button
                            label={primaryCtaLabel}
                            href={primaryCtaHref}
                          />
                        </Elevation>
                      </Group.Item>
                    )}
                  </Group>
                  <VerticalSpace size="96" />
                </Align>
              </Columns.Col>
              <Columns.Col spanM={1} />
              <Columns.Col spanM={6} />
            </Columns>
            {header === "on" && <VerticalSpace size="96" />}
          </Section>
          {curve === "on" && (
            <Curve
              bottomColor={curveBottomColor}
              from={curveFrom as any}
              size={curveSize as any}
            />
          )}
        </Poster>
      ),
    },
    Details: {
      // TODO replace with renderFields for better form API
      fields: {
        heading: { type: "text" },
        body: { type: "text" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
        imageSide: {
          type: "select",
          options: [
            { label: "left", value: "left" },
            { label: "right", value: "right" },
          ],
        },
        surface: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...surfaceBackgrounds.map((bg) => ({ label: bg, value: bg })),
          ],
        },
      },
      render: ({
        heading = "Heading",
        surface = "white", // TODO make this appear in input
        body = "Body",
        ctaHref = "#",
        ctaLabel = "Click me",
        imageSide,
      }) => (
        <Surface background={surface}>
          <Section>
            <VerticalSpace size="128" />
            <Columns>
              {imageSide !== "right" && (
                <Columns.Col spanM={6}>
                  <Image src="https://ui.digital-ent-int.bt.com/storybook/static/media/flow.bb824b99.svg" />
                </Columns.Col>
              )}
              {imageSide !== "right" && <Columns.Col spanM={1} />}

              <Columns.Col align="center" spanM={5}>
                <Heading color="brand" level="2" size="l">
                  {heading}
                </Heading>
                <VerticalSpace size="16" />
                <Text>{body}</Text>
                <VerticalSpace size="24" />
                {ctaHref && (
                  <Elevation>
                    <Button label={ctaLabel} href={ctaHref} />
                  </Elevation>
                )}
              </Columns.Col>

              {imageSide == "right" && <Columns.Col spanM={1} />}

              {imageSide === "right" && (
                <Columns.Col spanM={6}>
                  <Image src="https://ui.digital-ent-int.bt.com/storybook/static/media/flow.bb824b99.svg" />
                </Columns.Col>
              )}
            </Columns>
            <VerticalSpace size="128" />
          </Section>
        </Surface>
      ),
    },
    UniversalHeader: {
      fields: {
        links: {
          type: "group",
          groupFields: {
            href: { type: "text" },
            label: { type: "text" },
          },
        },
      },
      render: ({ links = [] }) => (
        <UniversalHeader>
          {links.map((item, i) => (
            <UniversalHeader.Item key={i} href={item.href}>
              {item.label}
            </UniversalHeader.Item>
          ))}
        </UniversalHeader>
      ),
    },
    SiteFooter: {
      fields: {
        surface: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...surfaceBackgrounds.map((bg) => ({ label: bg, value: bg })),
          ],
        },
      },
      render: ({ surface }) => (
        <Surface background={surface}>
          <SiteFooter
            logoLabel="BT logo"
            main={
              <>
                <SiteFooter.ItemGroup title="Find your business">
                  <SiteFooter.Item href="#">0-5 employees</SiteFooter.Item>
                  <SiteFooter.Item href="#">6-249 employees</SiteFooter.Item>
                  <SiteFooter.Item href="#">250+ employees</SiteFooter.Item>
                  <SiteFooter.Item href="#">Public sector</SiteFooter.Item>
                </SiteFooter.ItemGroup>
                <SiteFooter.ItemGroup title="Products">
                  <SiteFooter.Item href="#">
                    BT Halo for business
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">Broadband deals</SiteFooter.Item>
                  <SiteFooter.Item href="#">Business mobile</SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    Voice and collaboration
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">BTnet leased line</SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    Business phone lines
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    Corporate IP solutions
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    Corporate networking
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">Corporate security</SiteFooter.Item>
                </SiteFooter.ItemGroup>
                <SiteFooter.ItemGroup title="Useful links">
                  <SiteFooter.Item href="#">Contact BT</SiteFooter.Item>
                  <SiteFooter.Item href="#">Make a complaint</SiteFooter.Item>
                  <SiteFooter.Item href="#">Help & support</SiteFooter.Item>
                  <SiteFooter.Item href="#">Case studies</SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    Performance results
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">Why choose BT?</SiteFooter.Item>
                </SiteFooter.ItemGroup>
                <SiteFooter.ItemGroup title="Explore more on BT">
                  <SiteFooter.Item href="#">For the home</SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    For business and public sector
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">For wholesale</SiteFooter.Item>
                  <SiteFooter.Item href="#">BT Group</SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    <Icon icon="arcSocialLinkedin" size={16} /> Linkedin
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    <Icon icon="arcSocialTwitter" size={16} /> Twitter
                  </SiteFooter.Item>
                  <SiteFooter.Item href="#">
                    <Icon icon="arcSocialYouTube" size={16} /> YouTube
                  </SiteFooter.Item>
                </SiteFooter.ItemGroup>
              </>
            }
            siteName="BT Business"
          >
            <SiteFooter.Item href="#">Cookies</SiteFooter.Item>
            <SiteFooter.Item href="#">Terms of use</SiteFooter.Item>
            <SiteFooter.Item href="#">Code of practice</SiteFooter.Item>
            <SiteFooter.Item href="#">Privacy policy</SiteFooter.Item>
            <SiteFooter.Item href="#">Accessibility</SiteFooter.Item>
          </SiteFooter>
        </Surface>
      ),
    },
    "Card Deck": {
      fields: {
        surface: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...surfaceBackgrounds.map((bg) => ({ label: bg, value: bg })),
          ],
        },
      },
      render: ({ surface = "white" }) => (
        <Surface background={surface}>
          <Section>
            <VerticalSpace size="96" />
            <Heading align="center" color="brand" size="xl" level="2">
              Who we work with
            </Heading>
            <VerticalSpace size="96" />
            <Columns>
              <Columns.Col spanL={3} spanM={4} spanS={6}>
                <Card href="#" title="Small & medium">
                  Scalable business broadband and mobile packages that grow with
                  your business to help you stay connected and stay ahead.
                </Card>
              </Columns.Col>
              <Columns.Col spanL={3} spanM={4} spanS={6}>
                <Card href="#" title="Corporate">
                  Scalable business broadband and mobile packages that grow with
                  your business to help you stay connected and stay ahead.
                </Card>
              </Columns.Col>
              <Columns.Col spanL={3} spanM={4} spanS={6}>
                <Card href="#" title="Large corporate">
                  Strategic communications solutions to meet your
                  organisation&apos;s needs and help your teams work faster,
                  smarter and safer.
                </Card>
              </Columns.Col>
              <Columns.Col spanL={3} spanM={4} spanS={6}>
                <Elevation>
                  <Card href="#" fill="solid" title="Public sector">
                    Technology and business solutions to help manage and secure
                    your ICT portfolio and help you achieve a smarter digital
                    future.
                  </Card>
                </Elevation>
              </Columns.Col>
            </Columns>
            <VerticalSpace size="96" />
            <Align horizontal="center">
              <Button label="Contact us" />
            </Align>
          </Section>
          <VerticalSpace size="96" />
        </Surface>
      ),
    },
    Curve: {
      fields: {
        size: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...curveSizes.map((size) => ({
              label: size.toUpperCase(),
              value: size,
            })),
          ],
        },
        from: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...curvePositions.map((pos) => ({ label: pos, value: pos })),
          ],
        },
        bottomColor: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...surfaceBackgrounds.map((bg) => ({ label: bg, value: bg })),
          ],
        },
        topColor: {
          type: "select",
          options: [
            { label: "", value: "" },
            ...surfaceBackgrounds.map((bg) => ({ label: bg, value: bg })),
          ],
        },
      },
      render: ({ bottomColor = "black", topColor = "black", from, size }) => (
        <Curve
          bottomColor={bottomColor}
          topColor={topColor}
          from={from as any}
          size={size as any}
        />
      ),
    },
  },
};

export const initialData: Data<Props> = {
  page: { title: "New page" },
  content: [
    {
      type: "UniversalHeader",
      props: {
        id: "uniheader",
        links: [{ label: "Home", href: "#" }],
      },
    },
  ],
};

export default config;
