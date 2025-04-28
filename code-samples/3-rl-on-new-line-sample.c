#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <readline/readline.h>
#include <readline/history.h>

int main(void)
{
    char    *input;
    
    while (1)
    {
        input = readline("minishell$ ");
        if (input == NULL)
            break;
            
        if (*input)
        {
            add_history(input);
            
            if (strcmp(input, "show-progress") == 0)
            {
                // Kullanıcıya ilerleyiş çubuğu gösterme örneği
                printf("İşlem başlatıldı...\n");
                for (int i = 0; i < 5; i++)
                {
                    printf("İşleniyor: %d%%\n", i * 20);
                    usleep(500000);  // 0.5 saniye beklet
                }
                
                // Yeni bir satıra geçildiğini readline'a bildir
                rl_on_new_line();
                printf("İşlem tamamlandı!\n");
            }
            else if (strcmp(input, "exit") == 0)
            {
                free(input);
                break;
            }
        }
        
        free(input);
    }
    printf("Program sonlandırıldı.\n");
    return (0);
}