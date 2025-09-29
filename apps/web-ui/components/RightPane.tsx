import FilesPanel from './FilesPanel';
import ValuesPanel from './ValuesPanel';
import AdvancedParams from './AdvancedParams';

export default function RightPane() {
  return (
    <aside role="complementary" aria-label="Right Controls" className="flex flex-col gap-12">
      <FilesPanel />
      <ValuesPanel />
      <AdvancedParams />
    </aside>
  );
}
