import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Header,
  Link,
  SpaceBetween,
  Button,
} from "@cloudscape-design/components";

export default function DocumentsListHeader({ total }: { total?: number }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <Header
      variant="awsui-h1-sticky"
      description="Manage all knowledge documents"
      info={<Link variant="info" onFollow={() => dispatch({ type: 'layout/setToolsOpen', payload: true })}>Info</Link>}
      counter={`(${total !== undefined ? total : "..."})`}
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="primary" onClick={() => navigate("/documents/create")}>
            Upload Document
          </Button>
        </SpaceBetween>
      }
    >
      Documents
    </Header>
  );
}
