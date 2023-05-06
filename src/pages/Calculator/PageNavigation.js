import { useNavigate } from "react-router-dom";
import { Grid, InPageNavigation, Box, Button, theme } from "@hero-design/react";
import GeneralForm from "./GeneralForm";
import AdminForm from "./AdminForm";
import PrintingForm from "./PrintingForm";
import AdditionalForm from "./AdditionalForm";
import StatisticCard from "../../components/Statistic";
import calculateROI from "../../utils/functions";
import useStore from "../../context/store";

const PageNavigation = () => {
  const navigate = useNavigate();

  const {
    formData,
    adminDetails,
    generalErrors,
    setGeneralErrors,
    adminErrors,
    setAdminErrors,
    hasCalculated,
    setHasCalculated,
    totalTable,
    setTotalTable,
    setBenefitsTable,
    setCostsTable,
    setSidebarSelectedItemId,
    formSelectedItemId,
    setFormSelectedItemId,
  } = useStore();

  const runCalculations = () => {
    const { totalTable, benefitsTable, costsTable } = calculateROI(
      formData,
      adminDetails
    );
    setTotalTable(totalTable);
    setBenefitsTable(benefitsTable);
    setCostsTable(costsTable);
  };

  let currency;
  if (formData.country === "AU") {
    currency = "AUD";
  } else if (formData.country === "NZ") {
    currency = "NZD";
  } else if (formData.country === "UK") {
    currency = "GBP";
  } else if (formData.country === "SG") {
    currency = "SGD";
  } else if (formData.country === "MY") {
    currency = "MYR";
  } else {
    currency = "AUD";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });

  const onClickItem = (item) => {
    // The user will first arrive at the 'general' page.
    // Need to make sure the required fields on that page have been filled prior to the user leaving the page
    // If the user tries to calculate immediately without filling in requried fields, error messages will be shown
    // Only check for errors
    let currentErrors;
    if (formSelectedItemId === "general") {
      currentErrors = checkGeneralPageErrors();
      if (!currentErrors) setFormSelectedItemId(item.id);
    }

    if (formSelectedItemId === "adminDetails") {
      currentErrors = checkAdminPageErrors();
      if (!currentErrors) setFormSelectedItemId(item.id);
    }

    // condition which checks if only errors are found on the admin page and if so, sets the selected item state to the adminDetails page
    if (!currentErrors) setFormSelectedItemId(item.id);
  };

  const items = {
    "": [
      {
        id: "general",
        text: "General",
      },
      {
        id: "adminDetails",
        text: "Admin",
      },
      { id: "pagesPrinted", text: "Printing" },
      {
        id: "additional",
        text: "Additional",
      },
    ],
  };

  const checkAdminPageErrors = () => {
    let currentAdminErrors = { ...adminErrors };

    if (!adminDetails.onboardsPerYear) {
      currentAdminErrors = { ...currentAdminErrors, onboardsPerYear: true };
    } else {
      currentAdminErrors = { ...currentAdminErrors, onboardsPerYear: false };
    }

    if (!formData.hoursSpentOnEmploymentTasks) {
      currentAdminErrors = {
        ...currentAdminErrors,
        hoursSpentOnEmploymentTasks: true,
      };
    } else {
      currentAdminErrors = {
        ...currentAdminErrors,
        hoursSpentOnEmploymentTasks: false,
      };
    }

    setAdminErrors(currentAdminErrors);

    // if there are current errors, set the errors and return true
    return Object.values(currentAdminErrors).find((error) => error === true);
  };

  const checkGeneralPageErrors = () => {
    let currentGeneralErrors = { ...generalErrors };

    if (!formData.country) {
      currentGeneralErrors = { ...currentGeneralErrors, country: true };
    } else {
      currentGeneralErrors = { ...currentGeneralErrors, country: false };
    }

    if (!formData.plan) {
      currentGeneralErrors = { ...currentGeneralErrors, plan: true };
    } else {
      currentGeneralErrors = { ...currentGeneralErrors, plan: false };
    }

    if (!formData.admins) {
      currentGeneralErrors = { ...currentGeneralErrors, admins: true };
    } else {
      currentGeneralErrors = { ...currentGeneralErrors, admins: false };
    }

    if (!formData.fullTimeEmployees) {
      currentGeneralErrors = {
        ...currentGeneralErrors,
        fullTimeEmployees: true,
      };
    } else {
      currentGeneralErrors = {
        ...currentGeneralErrors,
        fullTimeEmployees: false,
      };
    }

    setGeneralErrors(currentGeneralErrors);

    // if there are current errors, set the errors and return true
    return Object.values(currentGeneralErrors).find((error) => error === true);
  };

  let savingsBackgroundColor;
  if (!totalTable.year1NetBenefits) {
    savingsBackgroundColor = "white";
  } else if (totalTable.year1NetBenefits > 0) {
    savingsBackgroundColor = theme.colors.palette.grotesqueGreenLight75;
  } else {
    savingsBackgroundColor = theme.colors.palette.pinkLight75;
  }

  let savingsFontColour;
  if (!totalTable.year1NetBenefits) {
    savingsFontColour = theme.colors.palette.violetDark45;
  } else if (totalTable.year1NetBenefits > 0) {
    savingsFontColour = theme.colors.palette.grotesqueGreenDark45;
  } else {
    savingsFontColour = theme.colors.palette.pinkDark45;
  }

  const handleSubmit = (e) => {
    // Preventing default form behaviour, is this required considering I don't really have a form?
    e.preventDefault();
    // If the user tries to calculate immediately without filling in requried fields, error messages will be shown
    const generalErrors = checkGeneralPageErrors();
    const adminErrors = checkAdminPageErrors();

    if (!generalErrors && adminErrors) {
      setFormSelectedItemId("adminDetails");
    }

    if (!generalErrors && !adminErrors) {
      runCalculations();
      if (!hasCalculated) setHasCalculated(true);
    }
  };

  const handleSeeFullResults = () => {
    setSidebarSelectedItemId("results");
    navigate("/results");
  };

  return (
    <Box
      sx={{
        p: "large",
        backgroundColor: "white",
        border: "1px solid rgb(218, 219, 222)",
        borderRadius: "10px",
      }}
    >
      <Grid>
        <Grid.Row gutter={["small", "small"]}>
          <Grid.Col span={[12, 4, 4, 4, 4]}>
            <InPageNavigation
              items={items}
              onClickItem={onClickItem}
              formSelectedItemId={formSelectedItemId}
            />
          </Grid.Col>
          <Grid.Col span={[12, 20, 20, 20, 20]}>
            {formSelectedItemId === "general" && (
              <GeneralForm
                checkGeneralPageErrors={checkGeneralPageErrors}
                runCalculations={runCalculations}
              />
            )}
            {formSelectedItemId === "adminDetails" && (
              <AdminForm
                checkAdminPageErrors={checkAdminPageErrors}
                runCalculations={runCalculations}
              />
            )}
            {formSelectedItemId === "additional" && (
              <AdditionalForm runCalculations={runCalculations} />
            )}
            {formSelectedItemId === "pagesPrinted" && (
              <PrintingForm runCalculations={runCalculations} />
            )}
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <Grid sx={{ mt: theme.space.xxxlarge }}>
        <Grid.Row gutter={["large", "large"]} style={{ alignItems: "center" }}>
          <Grid.Col span={[8, 8, 8, 8, 8]}>
            <Button
              variant="filled"
              intent="primary"
              size="medium"
              text="Calculate"
              type="submit"
              onClick={handleSubmit}
            />
            <Button
              disabled={!hasCalculated}
              variant="outlined"
              intent="primary"
              size="medium"
              text="See Full Results"
              onClick={handleSeeFullResults}
              sx={{ ml: "medium" }}
            />
          </Grid.Col>
          <Grid.Col span={[8, 8, 8, 8, 8]}>
            <StatisticCard
              title="Return On Investment"
              subtitle="3 Year Total"
              value={
                totalTable.threeYearTotalROI
                  ? `${totalTable.threeYearTotalROI.toFixed(0)}%`
                  : "0%"
              }
              backgroundColor="white"
              fontColor={theme.colors.palette.violetDark45}
            />
          </Grid.Col>
          <Grid.Col span={[8, 8, 8, 8, 8]}>
            <StatisticCard
              title="Net Savings"
              subtitle="Year 1"
              value={
                totalTable.year1NetBenefits
                  ? `${formatter.format(totalTable.year1NetBenefits)}`
                  : "$0.00"
              }
              backgroundColor={savingsBackgroundColor}
              fontColor={savingsFontColour}
              type="money"
            />
          </Grid.Col>
        </Grid.Row>
      </Grid>
    </Box>
  );
};

export default PageNavigation;
