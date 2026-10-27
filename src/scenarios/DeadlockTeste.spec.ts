
import { test } from '@playwright/test';
import { join } from 'path';
import { TheConfig } from 'sicolo';
import DeadlockPage from '../support/pages/DeadlockPage';

test.describe('Testes E2E - Deadlock API', () => {
  const CONFIG = join(__dirname, '../support/fixtures/config.yml');

  const BASE_URL = TheConfig.fromFile(CONFIG)
    .andPath('application.deadlock_QA')
    .retrieveData();

  let deadlockPage: DeadlockPage;

  test.beforeEach(async ({ page }) => {
    deadlockPage = new DeadlockPage(page);
    await page.goto(BASE_URL);
  });

  test('Caso 1 - Adivinhar o rank de um jogador', async () => {
    await deadlockPage.abrirGuessTheRank();
    await deadlockPage.selecionarRankDisponivel();
    await deadlockPage.confirmarPalpite();
    await deadlockPage.validarResultadoPalpite();
  });

  test('Caso 2 - Encontrar um jogador pelo rank no leaderboard', async () => {
    await deadlockPage.abrirLeaderboard();
    await deadlockPage.pesquisarRank(10);
    await deadlockPage.validarRankEncontrado(10);
  });

  test('Caso 3 - Verificar se um jogador existe', async () => {
    await deadlockPage.abrirPlayer();
    await deadlockPage.pesquisarJogador('ornate');
    await deadlockPage.validarJogadorEncontrado('ornate');
  });
});
