import {
  ActionList,
  Card,
  ContextualSaveBar,
  DatePicker,
  FormLayout,
  Frame,
  Layout,
  Loading,
  Navigation,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  TextContainer,
  Toast,
  TopBar,
} from "@shopify/polaris";
import { HomeMajor } from "@shopify/polaris-icons";
import { gql } from "apollo-boost";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
const countdownQuery = gql`
  {
    shop {
      id
      metafield(namespace: "global", key: "countdown_timer") {
        namespace
        id
        key
        value
      }
    }
  }
`;
const countdownMutation = gql`
  mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        namespace
        id
        key
        value
      }
      userErrors {
        code
        message
      }
    }
  }
`;
function CustomDatePicker({ onChange, defaultValue }) {
  const [selectedDates, setSelectedDates] = useState(() =>
    defaultValue ? new Date(defaultValue) : new Date()
  );
  const [{ month, year }, setDate] = useState({
    month: selectedDates.getMonth(),
    year: selectedDates.getFullYear(),
  });

  const handleMonthChange = useCallback((month, year) => {
    setDate({ month, year });
  }, []);
  useEffect(() => {
    if (defaultValue !== selectedDates) onChange(selectedDates);
  }, [defaultValue, onChange, selectedDates]);
  return (
    <DatePicker
      month={month}
      year={year}
      onChange={({ start }) => setSelectedDates(start)}
      onMonthChange={handleMonthChange}
      selected={selectedDates}
    />
  );
}

function Index() {
  const defaultState = useRef({
    countdownFieldValue: null,
  });
  const skipToContentRef = useRef(null);
  const [refreshKey, setrefreshKey] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const [userMenuActive, setUserMenuActive] = useState(false);
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [countdownFieldValue, setCountdownFieldValue] = useState(
    defaultState.current.countdownFieldValue
  );
  const countdownQueryResult = useQuery(countdownQuery);
  const [mutateFunction, { data, loading, error }] = useMutation(
    countdownMutation
  );
  useEffect(() => {
    if (countdownQueryResult?.data) {
      setIsLoading(false);
      defaultState.current.countdownFieldValue =
        countdownQueryResult?.data?.shop?.metafield?.value;
    }
  }, [countdownQueryResult?.data]);
  const handleDiscard = useCallback(() => {
    setCountdownFieldValue(defaultState.current.countdownFieldValue);
    setIsDirty(false);
    setrefreshKey(Date.now());
  }, []);
  const handleSave = useCallback(() => {
    mutateFunction({
      variables: {
        metafields: {
          ownerId: countdownQueryResult?.data?.shop?.id,
          namespace: "global",
          key: "countdown_timer",
          value: countdownFieldValue,
          type: "single_line_text_field",
        },
      },
    });
    defaultState.current.countdownFieldValue = countdownFieldValue;
    setIsDirty(false);
    setToastActive(true);
  }, [
    countdownFieldValue,
    countdownQueryResult?.data?.shop?.id,
    mutateFunction,
  ]);
  const handleFieldChange = useCallback((value) => {
    setCountdownFieldValue(value);
    defaultState.current.countdownFieldValue !== value && setIsDirty(true);
  }, []);

  const toggleToastActive = useCallback(
    () => setToastActive((toastActive) => !toastActive),
    []
  );
  const toggleUserMenuActive = useCallback(
    () => setUserMenuActive((userMenuActive) => !userMenuActive),
    []
  );
  const toggleMobileNavigationActive = useCallback(
    () =>
      setMobileNavigationActive(
        (mobileNavigationActive) => !mobileNavigationActive
      ),
    []
  );

  const toastMarkup = toastActive ? (
    <Toast onDismiss={toggleToastActive} content="Changes saved" />
  ) : null;

  const userMenuActions = [
    {
      items: [{ content: "Community forums" }],
    },
  ];

  const contextualSaveBarMarkup = isDirty ? (
    <ContextualSaveBar
      message="Unsaved changes"
      saveAction={{
        onAction: handleSave,
      }}
      discardAction={{
        onAction: handleDiscard,
      }}
    />
  ) : null;

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={userMenuActions}
      name="Meraki"
      initials="👍"
      open={userMenuActive}
      onToggle={toggleUserMenuActive}
    />
  );

  const searchResultsMarkup = (
    <ActionList
      items={[
        { content: "Shopify help center" },
        { content: "Community forums" },
      ]}
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={toggleMobileNavigationActive}
    />
  );

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        title="Meraki App"
        items={[
          {
            label: "Genaral",
            icon: HomeMajor,
          },
        ]}
      />
    </Navigation>
  );

  const loadingMarkup = isLoading ? <Loading /> : null;

  const skipToContentTarget = (
    <a id="SkipToContentTarget" ref={skipToContentRef} tabIndex={-1} />
  );

  const actualPageMarkup = (
    <Page key={refreshKey} title="General">
      <Layout>
        {skipToContentTarget}
        <Layout.AnnotatedSection
          title="Countdown timer"
          description="Select date and time"
        >
          <Card sectioned>
            <FormLayout>
              <CustomDatePicker
                onChange={handleFieldChange}
                defaultValue={
                  countdownQueryResult?.data?.shop?.metafield?.value
                }
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );

  const loadingPageMarkup = (
    <SkeletonPage>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={9} />
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );

  const pageMarkup = isLoading ? loadingPageMarkup : actualPageMarkup;

  return (
    <div style={{ height: "500px" }}>
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        showMobileNavigation={mobileNavigationActive}
        onNavigationDismiss={toggleMobileNavigationActive}
        skipToContentTarget={skipToContentRef.current}
      >
        {contextualSaveBarMarkup}
        {loadingMarkup}
        {pageMarkup}
        {toastMarkup}
      </Frame>
    </div>
  );
}
export default Index;
