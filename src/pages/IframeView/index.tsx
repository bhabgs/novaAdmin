import React from 'react';
import { useSearchParams } from 'react-router-dom';
import IframeContainer from '../../components/IframeContainer';
import styles from './index.module.less';

const IframeView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'Iframe Page';

  if (!url) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>No URL provided</p>
      </div>
    );
  }

  return (
    <div className={styles.iframeViewContainer}>
      <IframeContainer url={url} title={title} />
    </div>
  );
};

export default IframeView;
