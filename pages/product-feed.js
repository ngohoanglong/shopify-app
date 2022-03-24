import {
  Button,
  ButtonGroup,
  Card,
  DataTable,
  Form,
  FormLayout,
  Icon,
  Modal,
  Page,
  Select,
  TextField,
} from "@shopify/polaris";
import { DeleteMinor, EditMinor } from "@shopify/polaris-icons";
import { useCallback, useMemo, useState } from "react";
import useSWR, { SWRConfig, useSWRConfig } from "swr";
import AppLayout from "../components/AppLayout";

const fetcher = (query, variables) =>
  fetch("/api/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      operationName: null,
      variables,
      query,
    }),
  })
    .then((r) => r.json())
    .then((res) => res.data);
const useFetchGraphql = ({ query, variables }) => {
  const { data, error } = useSWR([query, variables]);
  return { data, error };
};
function getColumnContentTypes(data) {
  if (!data.length) return [];
  return [
    ...Object.keys(data[0]).map(function () {
      return "text";
    }),
    "numeric",
  ];
}
const QUERY_PRODUCTS = `{\n  feedColumns {\n    id\n    title\n    metafield\n    type\n    default\n  }\n}\n`;
function ModalAdd({ headings }) {
  const CURRENT_PAGE = "current_page";
  const ALL_CUSTOMERS = "all_customers";
  const SELECTED_CUSTOMERS = "selected_customers";
  const CSV_EXCEL = "csv_excel";
  const CSV_PLAIN = "csv_plain";

  const [active, setActive] = useState(false);
  const [selectedExport, setSelectedExport] = useState([]);
  const [selectedExportAs, setSelectedExportAs] = useState([]);

  const handleModalChange = useCallback(() => setActive(!active), [active]);

  const handleClose = () => {
    handleModalChange();
    handleSelectedExport([]);
    handleSelectedExportAs([]);
  };

  const handleSelectedExport = useCallback(
    (value) => setSelectedExport(value),
    []
  );

  const handleSelectedExportAs = useCallback(
    (value) => setSelectedExportAs(value),
    []
  );

  const activator = (
    <Button onClick={handleModalChange} fullWidth>
      Add row
    </Button>
  );

  return (
    <Modal
      activator={activator}
      open={active}
      onClose={handleClose}
      title="New feed"
    >
      <Modal.Section>
        <AddNewForm headings={headings} />
      </Modal.Section>
    </Modal>
  );
}
function getColumnHeadings(data) {
  return ["id", "title", "metafield", "type", "default", ""];
}
function getRows(data) {
  const result = data?.map(function (item) {
    return [
      ...Object.values(item).map((value, i) => {
        return value;
      }),
      <ButtonGroup key="action">
        <Button key="edit" outline size="slim">
          <Icon source={EditMinor} color="primary" />
        </Button>
        <Button key="remove" outline size="slim" destructive>
          <Icon source={DeleteMinor} color="base" />
        </Button>
      </ButtonGroup>,
    ];
  });
  return result || [];
}
const ProductFeed = () => {
  const {
    data: { feedColumns: data } = {
      feedColumns: [
        {
          id: "cl14ieflh0043ktojh65q32r8",
          title: "hellu",
          metafield: "test",
          type: "metafield",
          default: "12312321",
        },
      ],
    },
    error,
  } = useFetchGraphql({
    query: QUERY_PRODUCTS,
  });

  const { headings, columnContentTypes, rows } = useMemo(() => {
    return {
      columnContentTypes: getColumnContentTypes(data),
      rows: getRows(data),
      headings: getColumnHeadings(data),
    };
  }, [data]);
  return (
    <AppLayout>
      <Page title="Sales by product">
        <Card>
          <DataTable
            columnContentTypes={columnContentTypes}
            headings={headings}
            rows={rows}
            footerContent={<ModalAdd headings={headings} />}
          />
        </Card>
      </Page>
    </AppLayout>
  );
};
const AddNewForm = ({ headings, onSuccess }) => {
  const [values, setValues] = useState([]);
  const { mutate } = useSWRConfig();
  const handleSubmit = useCallback(
    async (_event) => {
      const data = {};
      headings
        .filter(Boolean)
        .filter((heading) => heading !== "id")
        .forEach((heading, i) => {
          data[heading] = values[i];
        });

      await fetcher(
        `mutation ($title:String $type:String, $default:String  ) {
            createFeedColumn(data: {title:$title, type:$type, default: $default}) {
              id
              title
              metafield
              type
              default
            }
          }`,
        data
      );
      mutate(QUERY_PRODUCTS);
    },
    [headings, mutate, values]
  );

  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        {headings
          .filter(Boolean)
          .filter((heading) => heading !== "id")
          .map((heading, i) => {
            if (heading == "type") {
              return (
                <Select
                  label={heading.toUpperCase()}
                  options={[
                    { label: "metafield mapping", value: "metafield" },
                    { label: "data mapping", value: "data" },
                  ]}
                  onChange={(value) => {
                    console.log(value);
                    const newValues = [...values];
                    newValues[i] = value;
                    setValues(newValues);
                  }}
                  value={values[i]}
                />
              );
            }
            return (
              <TextField
                key={heading}
                label={heading.toUpperCase()}
                value={values[i]}
                onChange={(value) => {
                  const newValues = [...values];
                  newValues[i] = value;
                  setValues(newValues);
                }}
                autoComplete="off"
              />
            );
          })}

        <Button primary submit>
          Add row
        </Button>
      </FormLayout>
    </Form>
  );
};
export const getStaticProps = async (ctx) => {
  return {
    props: {
      data: null,
    },
  };
};

export default function Index() {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        fetcher,
      }}
    >
      <ProductFeed />
    </SWRConfig>
  );
}
