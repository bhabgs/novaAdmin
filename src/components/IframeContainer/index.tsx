import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import styles from "./index.module.less";

interface IframeContainerProps {
  url: string;
  title?: string;
}

const IframeContainer: React.FC<IframeContainerProps> = ({ url, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [url]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
  };

  return (
    <>
      <Spin spinning={loading} size="large" tip="加载中..."></Spin>
      <iframe
        ref={iframeRef}
        src={url}
        title={title || "iframe"}
        className={styles["iframe-content"]}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        loading="lazy"
      />
    </>
  );
};

export default IframeContainer;
