const theme = {
  logo: <strong>Puck</strong>,
  project: {
    link: "https://github.com/measuredco/puck",
  },
  footer: {
    text: (
      <div className="flex w-full flex-col items-center sm:items-start">
        <p className="mt-6 text-xs">
          MIT © {new Date().getFullYear()} Measured Co.
        </p>
      </div>
    ),
  },
  chat: {
    link: "https://discord.gg/D9e4E3MQVZ",
    icon: (
      <img
        alt=""
        src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6918e57475a843f59f_icon_clyde_black_RGB.svg"
        height={32}
        width={32}
      />
    ),
  },
  toc: {
    backToTop: true,
  },
  banner: {
    key: "0.8.0-release",
    text: (
      <a
        href="https://github.com/measuredco/puck/releases/tag/v0.8.0"
        target="_blank"
      >
        🎉 Puck 0.8.0 is released which includes nested DropZones, new outline
        UI and much more. →
      </a>
    ),
  },
  docsRepositoryBase: "https://github.com/measuredco/puck/tree/main/app/docs",
  primarySaturation: 0,
};

export default theme;
