#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <readline/readline.h>
#include <readline/history.h>

volatile sig_atomic_t redisplay_needed = 0;

void sigint_handler(int sig)
{
    (void)sig;
    printf("\n");
    rl_on_new_line();
    rl_replace_line("", 1);
    rl_redisplay();
}

int main(void)
{
    char    *input;
    struct sigaction sa;
    
    // Sinyal işleyici ayarla
    sa.sa_handler = sigint_handler;
    sa.sa_flags = 0;
    sigemptyset(&sa.sa_mask);
    sigaction(SIGINT, &sa, NULL);
    
    printf("CTRL+C'ye basarak girişi temizleyebilirsiniz.\n\n");
    
    while (1)
    {
        input = readline("minishell$ ");
        if (input == NULL)  // Ctrl+D durumunda
            break;
            
        if (*input)
        {
            add_history(input);
            
            if (strcmp(input, "exit") == 0)
            {
                free(input);
                break;
            }
            
            printf("Komut işlendi: '%s'\n", input);
        }
        
        free(input);
    }
    printf("\nProgram sonlandırıldı.\n");
    return (0);
}