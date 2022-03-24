import AppLayout from "../components/AppLayout";

const Index = () => {
  return (
    <AppLayout>
      <div>Enter</div>
    </AppLayout>
  );
};

export const getStaticProps = async (ctx) => {
  return {
    props: {
      data: null,
    },
  };
};

export default Index;
