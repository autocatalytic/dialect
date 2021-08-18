import React from 'react';
import {ProtectedPage} from '../../components/Page';
import Messages from '../../components/Messages';

export default function ThreadKey(): JSX.Element {
  return (
    <ProtectedPage>
      <Messages />
    </ProtectedPage>
  );
}
