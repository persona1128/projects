"""Bundle WAV files so Web Audio also works when index.html is opened locally."""
import base64
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
data = {
    str(path.relative_to(root)): base64.b64encode(path.read_bytes()).decode('ascii')
    for path in sorted((root / 'assets/sfx').glob('*.wav'))
}
(root / 'sfx-data.js').write_text(
    '// Bundled WAV data for offline Web Audio decoding.\nwindow.SFX_DATA = '
    + json.dumps(data) + ';\n', encoding='utf-8')
