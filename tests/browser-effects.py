"""Preview regression check. Requires Python Playwright and Chromium; no server needed.

Run `npm run export` first, then `python tests/browser-effects.py`.
"""
import argparse
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--chromium', default=shutil.which('chromium'))
args = parser.parse_args()
html = (Path(__file__).resolve().parent.parent / 'dist/TBJ-tracker.html').read_text()

with sync_playwright() as p:
    launch_options = {'executable_path': args.chromium} if args.chromium else {}
    browser = p.chromium.launch(**launch_options)
    for permissions in ['allow-scripts', 'allow-scripts allow-forms']:
        page = browser.new_page(viewport={'width': 1280, 'height': 1000})
        errors, console = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: console.append(message.text))
        page.set_content(f'<iframe id="preview" sandbox="{permissions}" style="width:1200px;height:1000px"></iframe>')
        page.locator('iframe').evaluate('(frame, html) => frame.srcdoc = html', html)
        frame = page.frame_locator('#preview')
        spotter = frame.locator('[data-player="p4"]')
        spotter.locator('.effects-toggle').click()
        editor = spotter.locator('.effect-editor')
        editor.locator('[name="amount"]').fill('11')
        editor.locator('[name="rounds"]').fill('10')
        editor.locator('[name="label"]').fill('Test reason')
        editor.get_by_role('button', name='Add effect', exact=True).click()
        expect(spotter.locator('.next-range strong')).to_have_text('16–19')
        expect(spotter.locator('.effect-chip')).to_contain_text('10 rounds left')
        expect(spotter.locator('.effect-feedback')).to_contain_text('Next roll: 16–19')
        expect(editor).to_be_hidden()
        frame.locator('#mute').click()
        frame.locator('#play').click()
        expect(frame.locator('#roll-animation')).to_be_hidden(timeout=4000)
        turn = frame.locator('.turn-row').filter(has=page.locator('.turn-identity > strong', has_text='Spotter 4'))
        expect(turn.locator('.roll-value > span')).to_have_text('16–19')
        assert 16 <= int(turn.locator('.roll-value strong').inner_text()) <= 19
        expect(spotter.locator('.effect-chip')).to_contain_text('9 rounds left')
        spotter.locator('[data-remove-effect]').click()
        expect(spotter.locator('.next-range strong')).to_have_text('5–8')
        expect(turn.locator('.roll-value > span')).to_have_text('16–19')
        spotter.locator('.effects-toggle').click()
        editor.locator('[name="amount"]').fill('0')
        editor.get_by_role('button', name='Add effect', exact=True).click()
        expect(spotter.locator('.effect-feedback')).to_have_attribute('data-kind', 'error')
        expect(spotter.locator('.effect-feedback')).to_be_visible()
        expect(spotter.locator('.effect-chip')).to_have_count(0)
        editor.locator('[name="amount"]').fill('11')
        editor.locator('[name="rounds"]').fill('10')
        editor.locator('[name="label"]').press('Enter')
        expect(spotter.locator('.next-range strong')).to_have_text('16–19')
        expect(spotter.locator('.effect-feedback')).to_have_attribute('data-kind', 'success')
        frame.locator('#types-tab').click()
        frame.locator('#new-type-name').fill('Preview character')
        frame.locator('#add-character-type').click()
        expect(frame.locator('.type-row')).to_have_count(28)
        expect(frame.locator('#type-feedback')).to_contain_text('Preview character added')
        assert not errors, errors
        assert not any('Blocked form submission' in message for message in console), console
        print(f'PASS: {permissions}: Spotter +11 preview, actual roll, duration, removal, invalid-input feedback, Enter key, and character creation.')
        page.close()
    browser.close()
