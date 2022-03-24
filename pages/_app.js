import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import App from "next/app";

class MyApp extends App {
  render() {
    const theme = {};
    const { Component, pageProps, host } = this.props;
    return (
      <AppProvider theme={theme} i18n={translations}>
        <Component {...pageProps} />
      </AppProvider>
    );
  }
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
  };
};

export default MyApp;
