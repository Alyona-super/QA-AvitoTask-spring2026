import { test, expect } from '@playwright/test';


test.describe('UI Tests for Avito Moderation', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // Тест-1
    test('Фильтрация объявлений по диапазону цен', async ({ page }) => {
        //         await page.click('button:has-text("Фильтры"');
        await page.fill('input[placeholder="От"]', '500');
        await page.fill('input[placeholder="До"]', '1000');
        await page.mouse.click(0, 0);

        await page.waitForSelector('._card_15fhn_2');

        const prices = await page.$$eval('._card__price_15fhn_241', elements =>
            elements.map(el => parseInt(el.textContent?.replace(/[^0-9]/g, '') || '0'))
        );

        for (const price of prices) {
            expect(price).toBeGreaterThanOrEqual(500);
            expect(price).toBeLessThanOrEqual(1000);
        }
    });

    // Тест-2
    test('Сортировка объявлений по цене (возрастание/убывание)', async ({ page }) => {
        const sortBySelect = page.locator('._filters__select_1iunh_21').nth(0);
        const orderSelect = page.locator('._filters__select_1iunh_21').nth(1);
        await sortBySelect.selectOption('price');
        // Возрастание
        await orderSelect.selectOption('asc');
        await page.waitForTimeout(1000);
        const pricesAsc = await page.$$eval('._card__price_15fhn_241', els =>
            els.map(el => parseInt(el.textContent?.replace(/[^0-9]/g, '') || '0'))
        );
        const sortedAsc = [...pricesAsc].sort((a, b) => a - b);
        expect(pricesAsc).toEqual(sortedAsc);

        // Убывание
        await orderSelect.selectOption('desc');

        await page.waitForTimeout(1000);
        const pricesDesc = await page.$$eval('._card__price_15fhn_241', els =>
            els.map(el => parseInt(el.textContent?.replace(/[^0-9]/g, '') || '0'))
        );
        const sortedDesc = [...pricesDesc].sort((a, b) => b - a);
        expect(pricesDesc).toEqual(sortedDesc);
    });

    // Тест-3
    test('Фильтрация по выбранной категории', async ({ page }) => {
        const categorySelect = page.locator('._filters__select_1iunh_21').nth(2);
        await categorySelect.selectOption('1');
        //  await page.click('button:has-text("Применить")');
        await page.waitForSelector('._card_15fhn_2');

        const categories = await page.$$eval('._card__category_15fhn_259', els =>
            els.map(el => el.textContent?.trim())
        );

        for (const category of categories) {
            expect(category).toBe('Недвижимость');
        }
    });

    // Тест-4
    test('Отображение только срочных объявлений', async ({ page }) => {
        await page.click('._urgentToggle__slider_h1vv9_21');
        await page.waitForTimeout(1000);

        const urgentFlags = await page.$$eval('._card__priority_15fhn_172', els => els.length);
        const totalItems = await page.$$eval('._card_15fhn_2', els => els.length);

        expect(urgentFlags).toBe(totalItems);
    });

    // Тест-5
    test('Управление таймером автообновления статистики', async ({ page }) => {
        //await page.goto('/stats'); //Такой переход не работает, уведомление: "Страница не найдена"
        await page.getByText('Статистика').click();
        // Обновить таймер
         await page.waitForTimeout(5000);
         const untilRefresh = await page.textContent('._timeValue_ir5wu_112');
         await page.getByRole('button', { name: 'Обновить' }).click();
         const afterRefresh = await page.textContent('._timeValue_ir5wu_112');
         console.log('Таймер после обновления:', afterRefresh);
         expect(afterRefresh).not.toBe(untilRefresh);
         console.log('!!!Проверка функции обновления таймера успешно пройдена!');

         // Остановить таймер
         await page.getByLabel('Отключить автообновление').click();
         await expect(page.locator('._timeValue_ir5wu_112')).not.toBeVisible();
         await page.waitForTimeout(5000);
         await expect(page.locator('._timeValue_ir5wu_112')).not.toBeVisible();
         console.log('!!!Проверка функции остановки таймера успешно пройдена!');

         // Запустить таймер
         await page.getByLabel('Включить автообновление').click();
         //При нажатии на кнопку "Включить автообновление" на странице вновь должно появиться поле с обратным отсчетом, но оно не появлется

         const firstData = await page.textContent('._timeValue_ir5wu_112');
         await page.waitForTimeout(5000);
         const secondData = await page.textContent('._timeValue_ir5wu_112');
         expect(secondData).not.toBe(firstData);
         console.log('!!!Проверка функции обновления таймера успешно пройдена!');
   });

    // Тест-6
    test('Переключение между темной и светлой темой на мобильном разрешении', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        const getBgColor = async () => {
            return await page.evaluate(() =>
                getComputedStyle(document.body).backgroundColor
            );
        };

        const initialBg = await getBgColor();


        await page.click('._themeToggle_127us_1');
        //await page.getByRole('button', { name: 'Темная' }).click();

        await page.waitForTimeout(300);
        const darkBg = await getBgColor();
        expect(darkBg).not.toBe(initialBg);

        //await page.getByRole('button', { name: 'Светлая' }).click();

        await page.click('._themeToggle_127us_1');
        await page.waitForTimeout(300);
        const lightBg = await getBgColor();
        expect(lightBg).toBe(initialBg);


    });
});
