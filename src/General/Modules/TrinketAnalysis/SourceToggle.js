import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { useTranslation } from "react-i18next";
import { Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";

const useStyles = makeStyles((theme) => ({
  selected: {
    "&&": {
      backgroundColor: green[900],
      // color: theme.palette.secondary.main,
      "&:hover": {
        backgroundColor: green[900],
      },
    },
  },
}));

export default function SourceToggle(props) {
  const metric = props.metric;
  const setMetric = props.setMetric;
  const classes = useStyles();
  const { t } = useTranslation();
  const handleContent = (event, content) => {
    if (content === null) {
    } else {
      setMetric(content);
    }
  };

  // TODO: Localise Tooltips?
  return (
    <ToggleButtonGroup value={metric} onChange={setMetric} aria-label="contentToggle" size="small" style={{ padding: 8 }}>
      <ToggleButton style={{ padding: 5 }} value="Raids" aria-label="dpsLabel" classes={{ selected: classes.selected }}>
        <Tooltip title={"Raids"} arrow>
          <div style={{ display: "inline-flex" }}>
            <img
              style={{ height: 18, width: 18, margin: "2px 5px 0px 0px", verticalAlign: "middle", borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.12)" }}
              src={require("Images/achievement_raid_torghastraid.jpg").default}
              alt={"Raids"}
            />
            <Typography variant="button">{"Raids"}</Typography>
          </div>
        </Tooltip>
      </ToggleButton>

      <ToggleButton style={{ padding: 5 }} value="Dungeons" aria-label="dpsLabel" classes={{ selected: classes.selected }}>
        <Tooltip title={"Dungeons"} arrow>
          <div style={{ display: "inline-flex" }}>
            <img style={{ height: 18, width: 18, margin: "2px 5px 0px 0px", verticalAlign: "middle", borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.12)" }} src={require("Images/inv_relics_hourglass.jpg").default} alt={"Dungeons"} />
            <Typography variant="button">{"Dungeons"}</Typography>
          </div>
        </Tooltip>
      </ToggleButton>

      <ToggleButton style={{ padding: 5 }} value="LegionTimewalking" aria-label="legionTimewalking" classes={{ selected: classes.selected }}>
        <Tooltip title={"Legion Timewalking"} arrow>
          <div style={{ display: "inline-flex" }}>
            <img
              style={{ height: 18, width: 18, margin: "2px 5px 0px 0px", verticalAlign: "middle", borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.12)" }}
              src={require("Images/Resources/inv_legionadventure.jpg").default}
              alt={"Legion"}
            />
            <Typography variant="button">{"Legion"}</Typography>
          </div>
        </Tooltip>
      </ToggleButton>

      <ToggleButton style={{ padding: 5 }} value="The Rest" aria-label="hpsLabel" classes={{ selected: classes.selected }}>
        <Tooltip title={"The Rest"} arrow>
          <div style={{ display: "inline-flex" }}>
            <img style={{ height: 18, width: 18, margin: "2px 5px 0px 0px", verticalAlign: "middle", borderRadius: 4 }} src={require("Images/Resources/worldQuest.png").default} alt={"World Quests"} />
            <Typography variant="button">{"The Rest"}</Typography>
          </div>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}