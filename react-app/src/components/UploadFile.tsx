import React from "react";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import { UploadedFile } from "../interfaces/UploadedFile";

interface UploadFileProps {
  selectedFile?: UploadedFile;
  hadError: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadFile: React.FC<UploadFileProps> = ({
  selectedFile,
  hadError,
  onChange,
}) => {
  const uploadButtonRef = React.useRef<any>(null);

  const getUploadButtonIcon = () => {
    if (hadError) {
      return "warning sign";
    }
    return selectedFile ? "exchange" : "upload";
  };

  return (
    <Segment placeholder size="mini" className="upload-segment">
      <input
        type="file"
        onChange={onChange}
        hidden
        accept="application/JSON"
        ref={uploadButtonRef}
      />
      <Header icon>
        <Icon name="file outline" />
        {selectedFile ? selectedFile?.name : "No file uploaded"}
      </Header>
      <Button
        icon
        labelPosition="right"
        color={hadError ? "orange" : "teal"}
        // onClick={onClick}
        onClick={() => {
          uploadButtonRef.current?.click();
        }}
      >
        {selectedFile ? "Replace File" : "Upload"}
        <Icon name={getUploadButtonIcon()} />
      </Button>
      <div className="extension-text">*.json format</div>
    </Segment>
  );
};

export default UploadFile;
