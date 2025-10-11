import React from "react";
import MarkdownViewer from "../../components/MarkdownViewer";
import { PageContainer } from "@/components";
import { t } from "i18next";

const TemplateIntroduction: React.FC = () => {
  return (
    <PageContainer title={t("menu.templateIntroduction")} ghost>
      <MarkdownViewer url="./README.md" />
    </PageContainer>
  );
};

export default TemplateIntroduction;
