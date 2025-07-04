@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

SET ERR=0

:: It is assumed that ImageMagick is in the system path.
:: Download: https://www.imagemagick.org/script/download.php

SET MDX_ICON_SVG=mdx-win-icon.svg
SET PNG_SIZES=16 20 24 30 32 36 40 48 60 64 72 80 96 100 125 150 200 256 400 512
SET PNG_FILES=

SET SRCDIR=%~dp0
IF !SRCDIR:~-1!==\ SET SRCDIR=!SRCDIR:~0,-1!

SET PNGDIR=!SRCDIR!\PNG
IF NOT EXIST "!PNGDIR!" MKDIR "!PNGDIR!"

IF [%~1] NEQ [] (
    IF EXIST "%~1" SET MDX_ICON_SVG=%~1
)
CALL :GET_BASENAME "!MDX_ICON_SVG!" MDX_ICON_FILENAME

:: Generate the temporary PNG files for the ICO file
FOR %%S IN (!PNG_SIZES!) DO (
    CALL :CREATE_PNG_SET %%~S
    SET PNG_FILES=%%~S.png !PNG_FILES!
)

:: Create the ICO file from the PNG files created
CD "!PNGDIR!"
ECHO.
ECHO Creating ICO file 'mdx.ico'...
magick !PNG_FILES! "..\mdx.ico"
CD ..

:: Remove the temporary PNG folder
ECHO Removing temporary PNG folder...
RMDIR /S /Q "!PNGDIR!" >NUL
ECHO.

:: Create the 1024x1024 PNG file from the SVG source
ECHO Creating !MDX_ICON_FILENAME!.png at 1024x1024 resolution...
magick -background none "!SRCDIR!\!MDX_ICON_SVG!" -resize "1024x1024" "!SRCDIR!\!MDX_ICON_FILENAME!.png"

GOTO :END

:CREATE_PNG_SET
    ECHO Creating: %~1.png...
    magick -background none "!SRCDIR!\!MDX_ICON_SVG!" -resize "%~1x%~1" "!PNGDIR!\%~1.png"
GOTO :EOF

:GET_BASENAME
    IF [%~1] NEQ [] (
        SET TMP_FN=%~n1
        IF [%~2] EQU [] (
            SET BASENAME=!TMP_FN!
        ) ELSE (
            SET "%~2=!TMP_FN!"
        )
    ) ELSE (
        ECHO **WARN** SUBROUTINE: GET_BASENAME "FILENAME" VARIABLE
    )
GOTO :EOF

:END
EXIT /B !ERR!
