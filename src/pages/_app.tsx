import type { AppProps } from "next/app";
import Head from 'next/head';
import Layout from "@/components/Layout";
import "@/styles/common.css";
import "@/styles/globals.css";
import "@/styles/index.css";
import "@/styles/proposal.css";
import "@/styles/briefs.css";
import "@/styles/new-brief.css";
import "@/styles/new-freelancer.css";
import "@/styles/brief-details.css";
import "@/styles/submit-proposal.css";
import "@/styles/muiGlobal.css"
import "@/styles/stream-chat.css"
import { ThemeProvider, createTheme } from "@mui/material";


export default function App({ Component, pageProps }: AppProps) {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#b2ff0b',
      },
      secondary: {
        main: '#411dc9',
      },
    },
  });
  return (
    <>
      <Head><title>Imbue</title></Head>
      <Layout>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Layout>
    </>
  );
}
