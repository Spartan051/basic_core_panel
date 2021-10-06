
const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const trustHttpServer = require("./server/trust-login");
const corporateHttpServer = require("./server/corporate");
const businessHttpServer = require("./server/business");
const { router: activeManagerHttpServer } = require("./server/active-manager");
const externalMenuHttpServer = require("./server/external-menu");
//const router = require("./server/trust-login");

module.exports = {
  entry: {
    basispanel: {
      import: "./src/Loader.ts",
      filename: "basiscore.basispanel.js",
      library: {
        name: "basispanel",
        type: "assign",
      },
    },
    gridComponent: {
      import: "./src/ComponentLoader.ts",
      filename: "basiscore.basispanel.component.js",
      library: {
        name: "basispanel",
        type: "assign",
      },
    },
  },
  devServer: {
    static: path.resolve(__dirname, "wwwroot"),
    onBeforeSetupMiddleware: function (server) {
      server.app.use("/server/trust", trustHttpServer);
      server.app.use("/server/corporate", corporateHttpServer);
      server.app.use("/server/business", businessHttpServer);
      server.app.use("/server/active", activeManagerHttpServer);
      server.app.use("/server/external", externalMenuHttpServer);
    },
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|html)$/,
        type: "asset/source",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".png", ".html"], // there's a dot missing
  },
  plugins: [
    new CircularDependencyPlugin({
      // `onStart` is called before the cycle detection starts
      onStart({ compilation }) {
        console.log("start detecting webpack modules cycles");
      },
      // `onDetected` is called for each module that is cyclical
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        // `paths` will be an Array of the relative module paths that make up the cycle
        // `module` will be the module record generated by webpack that caused the cycle
        compilation.errors.push(new Error(paths.join(" -> ")));
      },
      // `onEnd` is called before the cycle detection ends
      onEnd({ compilation }) {
        console.log("end detecting webpack modules cycles");
      },
    }),
  ],
};
