import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, Grid, Divider, Paper } from "@mui/material";
import ItemUpgradeCard from "./ItemUpgradeCard";
import UpgradeFinderBossImages from "./BossImages";
import "./Panels.css";
import { useTranslation } from "react-i18next";
import { encounterDB } from "../../../../Databases/InstanceDB";
import { filterItemListBySource, getDifferentialByID } from "../../../Engine/ItemUtilities";
import i18n from "i18next";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    marginTop: 4,
    padding: 4,
  },
}));

export default function WorldBossGearContainer(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const itemList = props.itemList;
  const itemDifferentials = props.itemDifferentials;
  const currentLanguage = i18n.language;

  const contentGenerator = () => {
    return encounterDB[1192].bossOrder.map((key, i) => (
      <Grid item xs={12} key={"worldBossContainer-" + i}>
        <Paper style={{ backgroundColor: "#191c23", border: "1px solid rgba(255, 255, 255, 0.22)" }}>
          <Grid container>
            <Grid item>
              <div
                style={{
                  width: 94,
                  height: 100,
                  backgroundImage: `url(${UpgradeFinderBossImages(key)})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center 60%",
                  backgroundSize: "auto 100%",
                }}
                className="container-UpgradeCards"
              >
                <Typography variant="h6" noWrap className="centered-UpgradeCards-Dungeons">
                  {encounterDB[1192][key].name[currentLanguage]}
                </Typography>
              </div>
            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={12} sm container spacing={1} style={{ padding: 8 }}>
              {[...filterItemListBySource(itemList, 1192, key, 207)].map((item, index) => (
                <ItemUpgradeCard key={index} item={item} itemDifferential={getDifferentialByID(itemDifferentials, item.id, item.level)} slotPanel={false} />
              ))}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    ));
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        {contentGenerator(props.type)}
      </Grid>
    </div>
  );
}
