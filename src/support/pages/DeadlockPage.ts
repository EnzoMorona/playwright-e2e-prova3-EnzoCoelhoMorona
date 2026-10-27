
import { Page, Locator, expect } from '@playwright/test';

export default class DeadlockPage {
  readonly page: Page;

  readonly botaoLockInGuess: Locator;
  readonly opcoesRank: Locator;
  readonly inputJumpToRank: Locator;
  readonly inputSearchPlayer: Locator;

  constructor(page: Page) {
    this.page = page;

    this.botaoLockInGuess = page.getByRole('button', {
      name: /lock in guess/i,
    });

    // Ajuste esta expressão se os nomes dos ranks
    // apresentados pelo site forem diferentes.
    this.opcoesRank = page.getByRole('button', {
      name: /^(Initiate|Seeker|Acolyte|Arcanist|Ritualist|Emissary|Archon|Oracle|Phantom|Ascendant|Eternus)(\s+\d+)?$/i,
    });

    this.inputJumpToRank = page.getByPlaceholder(
      'Jump to rank',
      { exact: true },
    );

    this.inputSearchPlayer = page.getByPlaceholder(
      /search player/i,
    );
  }



async abrirGuessTheRank() {
  await this.page.goto(
    'https://deadlock-api.com/games/guess-the-rank'
  );

  // Localiza o pop-up de ajuda
  const dialog = this.page.locator(
    '[role="dialog"][data-slot="feedback-notice-dialog"]'
  );

  // Localiza o botão Close dentro do pop-up
  const botaoClose = dialog.locator(
    'button[data-slot="button"]',
    { hasText: 'Close' }
  );

  // Aguarda o botão aparecer e fecha o pop-up
  await botaoClose.waitFor({
    state: 'visible',
    timeout: 15000,
  });

  await botaoClose.click();

  // Confirma que o diálogo foi fechado
  await expect(dialog).toBeHidden({
    timeout: 10000,
  });

  // Aguarda as opções de rank aparecerem
  await expect(this.opcoesRank.first()).toBeVisible({
    timeout: 30000,
  });
}

  async selecionarRankDisponivel() {
    const total = await this.opcoesRank.count();

    expect(
      total,
      'Deveria haver pelo menos uma opção de rank.',
    ).toBeGreaterThan(0);

    // Seleciona uma opção disponível para testar
    // o envio do palpite, não sua exatidão.
    await this.opcoesRank.first().click();

    await expect(this.botaoLockInGuess).toBeEnabled();
  }

  async confirmarPalpite() {
    await this.botaoLockInGuess.click();
  }

  async validarResultadoPalpite() {
    // Após o envio, o botão deve deixar de estar
    // disponível para enviar o mesmo palpite novamente.
    await expect(this.botaoLockInGuess).toBeHidden({
      timeout: 15000,
    });

    // Confirma que o site apresentou o resultado.
    // A expressão deve ser adaptada ao texto real
    // mostrado depois de Lock In Guess.
    await expect(
      this.page.getByText(
        /actual rank|correct|incorrect|your guess/i,
      ).first(),
    ).toBeVisible({ timeout: 15000 });
  }

  async abrirLeaderboard() {
    await this.page.goto(
      'https://deadlock-api.com/community/leaderboard',
    );

    await expect(
      this.page.getByRole('heading', {
        name: /deadlock leaderboards/i,
      }),
    ).toBeVisible();

    await expect(this.inputJumpToRank).toBeVisible();
  }

  async pesquisarRank(rank: number) {
    await this.inputJumpToRank.fill(String(rank));
    await this.inputJumpToRank.press('Enter');
  }

  async validarRankEncontrado(rank: number) {
    const linhaRank = this.page
      .getByRole('row')
      .filter({
        has: this.page.getByRole('cell', {
          name: String(rank),
          exact: true,
        }),
      });

    await expect(linhaRank.first()).toBeVisible({
      timeout: 15000,
    });

    // Confirma que a linha do rank contém um jogador.
    await expect(linhaRank.first()).not.toBeEmpty();
  }

  async abrirPlayer() {
    await this.page.goto(
      'https://deadlock-api.com/analytics/players',
    );

    await expect(
      this.page.getByRole('heading', {
        name: /deadlock player scoreboard/i,
      }),
    ).toBeVisible();

    await expect(this.inputSearchPlayer.first()).toBeVisible();
  }

  async pesquisarJogador(nome: string) {
    await this.inputSearchPlayer.first().fill(nome);
  }

  async validarJogadorEncontrado(nome: string) {
    const linhaJogador = this.page
      .getByRole('row')
      .filter({
        hasText: new RegExp(
          nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'i',
        ),
      });

    await expect(linhaJogador.first()).toBeVisible({
      timeout: 15000,
    });
  }
}
