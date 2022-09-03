import React from "react";
import { classColoursJS } from "../../Functions/ClassColourFunctions";
import classIcons from "../../Functions/IconFunctions/ClassIcons";
import { getTranslatedClassName } from "locale/ClassNames";
import { useTranslation } from "react-i18next";

export default function ClassEditRender(props, characterClass) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.currentLanguage;
  let data = { ...props.rowData };
  /* -------------------------------- Handles no name defined -------------------------------- */
  if (data[characterClass] === "" || data[characterClass] === undefined) {
    return null;
  }

  return (
    <div style={{ color: classColoursJS(data[characterClass]), display: "inline-flex" }}>
      {data[characterClass] === undefined ? "" : classIcons(data[characterClass], { height: 30, width: 30, padding: "0px 5px 0px 5px", verticalAlign: "middle", borderRadius: 4 })}
      {getTranslatedClassName(data[characterClass], currentLanguage)}
    </div>
  );
}
