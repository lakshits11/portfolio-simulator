import React from 'react';
import { Block } from 'baseui/block';

interface ContainerProps {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <Block
      display="flex"
      justifyContent="center"
      minHeight="100vh"
      backgroundColor="#f3f4f6"
    >
      <Block
        width="100%"
        maxWidth="768px"
        padding="1.25rem"
        backgroundColor="white"
        overrides={{
          Block: {
            style: {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '8px',
              margin: '1.25rem'
            }
          }
        }}
      >
        {children}
      </Block>
    </Block>
  );
}; 